import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, getManager, Repository } from 'typeorm';
import { OgdrDto, UpdateOgdrDto } from './data/dtos/occupational-group-duties-responsibilities.dto';
import { OccupationalGroupDutiesResponsibilities } from './data/entities/occupational-group-duties-responsibilities.entity';
import { DutyType } from './utils/enums/duty-type.enum';
import { OccupationalGroupDutiesResponsibilitiesType } from './utils/occupational-group-duties-responsibilities.types';

@Injectable()
export class OccupationalGroupDutiesResponsibilitiesService extends BaseEntityCrudService<OccupationalGroupDutiesResponsibilities> {
  constructor(@InjectRepository(OccupationalGroupDutiesResponsibilities) private readonly ogdrRepo: Repository<OccupationalGroupDutiesResponsibilities>) {
    super(ogdrRepo);
  }

  /**
   * @audience Employee Portal
   *
   * @description Gets all positions under the manager's supervision
   *
   * @param positionId
   *
   */
  async getPositionsUnderManager(positionId: string) {
    const employeeId = (await this.entityRepository.query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [positionId]))[0].employeeId;
    const oicPositionId = await this.entityRepository.query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    let positions;
    if (oicPositionId.length > 0) positions = (await this.ogdrRepo.query(`CALL sp_get_positions_under_manager(?);`, [oicPositionId[0].positionId]))[0];
    else positions = (await this.ogdrRepo.query(`CALL sp_get_positions_under_manager(?);`, [positionId]))[0];
    return positions;
  }

  async getPermanentPositionsUnderManager(positionId: string) {
    const employeeId = (await this.entityRepository.query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [positionId]))[0].employeeId;
    const oicPositionId = await this.entityRepository.query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    let positions;
    if (oicPositionId.length > 0) positions = (await this.ogdrRepo.query(`CALL sp_get_permanent_positions_under_manager(?);`, [oicPositionId[0].positionId]))[0];
    else positions = (await this.ogdrRepo.query(`CALL sp_get_permanent_positions_under_manager(?);`, [positionId]))[0];
    return positions;
  }

  async getPermanentUnfilledFilledUnderManager(positionId: string) {
    //sp_get_permanent_filled_unfilled_positions_under_manager
    const employeeId = (await this.entityRepository.query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [positionId]))[0].employeeId;
    const oicPositionId = await this.entityRepository.query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    let positions;
    if (oicPositionId.length > 0) positions = (await this.ogdrRepo.query(`CALL sp_get_permanent_filled_unfilled_positions_under_manager(?);`, [oicPositionId[0].positionId]))[0];
    else positions = (await this.ogdrRepo.query(`CALL sp_get_permanent_filled_unfilled_positions_under_manager(?);`, [positionId]))[0];
    return positions;
  }

  /**
   * @audience Employee Portal
   *
   * Gets all core and support duties and responsibilities of a specific position
   * under the requesting manager;
   *
   * @param empPositionId The position Id of the manager
   * @param positionId The position id of the position title selected by the manager
   */
  async getPositionDutiesResponsibilities(empPositionId: string, positionId: string) {
    const core = await this.getDutiesResponsibilities(positionId, DutyType.CORE);
    const support = await this.getDutiesResponsibilities(positionId, DutyType.SUPPORT);

    return { core, support };
  }

  async getPendingDutiesAndResponsibilities(positionId: string) {
    /**
     * 1. kunin ang employeeId sa positionId na binala
     * 2. silipin kung nandun sa oic
     * 3. kunin ung inassume na positionId dun sa oic
     * 4. ibala sa stored procedure
     */

    const employeeId = (await this.entityRepository.query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [positionId]))[0].employeeId;
    const oicPositionId = await this.entityRepository.query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    const positions = await this.getPermanentPositionsUnderManager(positionId);
    const positionIds = await Promise.all(
      positions.map((position) => {
        return position.positionId;
      }),
    );

    const pendingDutiesAndResponsibilities = await this.entityRepository.query(
      `
      SELECT position_id positionId, position_title positionTitle, item_number itemNumber, get_position_assignment(position_id) designation,get_salary_grade_by_id(get_salary_grade_id_by_position_id(position_id)) salaryGrade
        FROM plantilla_view pv 
      INNER JOIN occupational_group og ON og.position_id_fk = pv.position_id
      INNER JOIN occupational_group_duties_responsibilities ogdr ON ogdr.occupational_group_id_fk = og._id
      WHERE pv.position_id IN (?) AND ogdr.occupational_group_id_fk IN 
      (  
         (SELECT occupationalGroupId 
         FROM 
         (SELECT sum(ogdr.percentage) as percentage, ogdr.occupational_group_id_fk occupationalGroupId FROM occupational_group_duties_responsibilities ogdr    
      		GROUP BY ogdr.occupational_group_id_fk) 
            a 
         WHERE a.percentage < 100 AND duty_type = 'core' 
         )
          UNION 
           (SELECT occupationalGroupId 
         FROM 
        (SELECT sum(ogdr.percentage) as percentage, ogdr.occupational_group_id_fk occupationalGroupId FROM occupational_group_duties_responsibilities ogdr    
      		GROUP BY ogdr.occupational_group_id_fk) 
            a 
         WHERE a.percentage < 100 AND duty_type = 'support' 
         )
      )
      UNION
      (
        SELECT position_id positionId, position_title positionTitle, item_number itemNumber,get_position_assignment(position_id) designation,get_salary_grade_by_id(get_salary_grade_id_by_position_id(position_id)) salaryGrade
        FROM plantilla_view pv INNER JOIN occupational_group og ON og.position_id_fk = pv.position_id  
        WHERE  pv.position_id IN (?) AND og._id NOT IN (SELECT occupational_group_id_fk FROM occupational_group_duties_responsibilities)
      );
      `,
      [positionIds, positionIds],
    );
    return pendingDutiesAndResponsibilities;
  }

  async getFinishedDutiesAndResponsibilities(positionId: string) {
    const positions = await this.getPermanentUnfilledFilledUnderManager(positionId);
    const positionIds = await Promise.all(
      positions.map((position) => {
        return position.positionId;
      }),
    );

    return await this.entityRepository.query(
      `
    (SELECT distinct position_id positionId, pv.position_title positionTitle, pv.item_number itemNumber, get_position_assignment(position_id) designation,has_employee(position_id) hasEmployee, has_ongoing_prf(position_id) hasOngoingPrf,IF(pp.employee_id_fk IS NOT NULL, get_employee_fullname(pp.employee_id_fk),null) employeeName  ,DATE_FORMAT(ogdr.updated_at, '%Y-%m-%d') updatedAt
    FROM plantilla_view pv 
      INNER JOIN occupational_group og ON og.position_id_fk = pv.position_id
      INNER JOIN occupational_group_duties_responsibilities ogdr ON ogdr.occupational_group_id_fk = og._id
      INNER JOIN plantilla_positions pp ON pp._id = pv.position_id 
    WHERE pv.position_id IN (?) AND pp._id <> ? AND ogdr.occupational_group_id_fk IN 
    (SELECT occupationalGroupId 
      FROM 
      (SELECT sum(ogdr.percentage) as percentage, ogdr.occupational_group_id_fk occupationalGroupId FROM occupational_group_duties_responsibilities ogdr    
    GROUP BY ogdr.occupational_group_id_fk) a WHERE a.percentage >= 100)) UNION (
      SELECT distinct position_id positionId, pv.position_title positionTitle, pv.item_number itemNumber, get_position_assignment(position_id) designation,has_employee(position_id) hasEmployee, has_ongoing_prf(position_id) hasOngoingPrf ,IF(pp.employee_id_fk IS NOT NULL, get_employee_fullname(pp.employee_id_fk),null) employeeName ,DATE_FORMAT(ogdr.updated_at, '%Y-%m-%d') updatedAt 
          FROM plantilla_view pv 
      LEFT JOIN occupational_group og ON og.position_id_fk = pv.position_id
      LEFT JOIN occupational_group_duties_responsibilities ogdr ON ogdr.occupational_group_id_fk = og._id
      INNER JOIN plantilla_positions pp ON pp._id = pv.position_id 
      WHERE pv.position_id IN (?) AND pp._id <> ?
    )`,
      [positionIds, positionId, positionIds, positionId],
    );
  }

  private async getDutiesResponsibilities(positionId: string, dutyType: DutyType) {
    try {
      const result = await this.entityRepository
        .createQueryBuilder('ogdr')
        .select('ogdr._id', 'ogdrId')
        .addSelect('dr.description', 'description')
        .addSelect('dr._id', 'drId')
        .addSelect('odr._id', 'odrId')
        .addSelect('truncate(ogdr.percentage,0)', 'percentage')
        .addSelect('cm.name', 'name')
        .addSelect('cm.code', 'code')
        .addSelect('cm.`desc`', 'competencyDescription')
        .addSelect('p.keyActions', 'keyActions')
        .addSelect('pcpl._id', 'pcplId')
        .addSelect('p.level', 'level')
        .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = ogdr.pcpl_id_fk')
        .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
        .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
        .innerJoin('occupations_duties_responsibilities', 'odr', 'odr._id = ogdr.odr_id_fk')
        .innerJoin('duties_responsibilities', 'dr', 'dr._id = odr.duties_responsibilities_id_fk')
        .innerJoin('occupational_group', 'og', 'og._id = ogdr.occupational_group_id_fk')
        .where(`og.position_id_fk = :positionId AND ogdr.duty_type= :dutyType `, { positionId, dutyType })
        .getRawMany();

      const drs = await Promise.all(
        result.map(async (dr) => {
          const { ogdrId, description, drId, odrId, percentage, name, code, competencyDescription, keyActions, pcplId, level } = dr;
          return {
            ogdrId,
            description,
            drId,
            odrId,
            percentage: parseInt(percentage),
            competency: {
              level,
              pcplId,
              code,
              name,
              competencyDescription,
              keyActions,
            },
          };
        }),
      );
      return drs;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  /**
   * @audience Employee Portal
   *
   * @description Update Duties and Responsibilities of a specific position
   */

  /**
   * @audience Employee Portal
   *
   * @description Update Duties and Responsibilities of a specific position
   */
  private async addOgdrTransaction(entityManager: EntityManager, ogdrType: OccupationalGroupDutiesResponsibilitiesType, positionId: string, dutyType: DutyType) {
    const og = await entityManager.query('SELECT _id,occupation_id_fk FROM occupational_group WHERE position_id_fk = ?', [positionId]);
    const { ogdrId, ...rest } = ogdrType;
    return await entityManager.getRepository(OccupationalGroupDutiesResponsibilities).save({ _id: ogdrId, ...rest, occupationalGroupId: og[0]._id, dutyType });
  }
  private async updateOgdrTransaction(entityManager: EntityManager, ogdrType: OccupationalGroupDutiesResponsibilitiesType, dutyType: DutyType) {
    const { ogdrId, percentage, pcplId } = ogdrType;
    return await entityManager
      .getRepository(OccupationalGroupDutiesResponsibilities)
      .createQueryBuilder()
      .update()
      .set({ dutyType: dutyType, percentage, pcplId })
      .where({ _id: ogdrId })
      .execute();
  }
  private async deleteOgdrTransaction(entityManager: EntityManager, ogdrIds: string[]) {
    if (ogdrIds.length > 0) return await entityManager.query(`DELETE FROM occupational_group_duties_responsibilities WHERE _id IN (?)`, [ogdrIds]);
    return null;
  }

  async updateDRPercentagePerPosition(positionId: string, updateOgdrDTO: UpdateOgdrDto) {
    try {
      console.log('PERCENTAGE', updateOgdrDTO);
      const { add, update } = updateOgdrDTO;
      const updateResult = await getManager().transaction(async (transactionEntityManager) => {
        let addCoreResult = [];
        if (add.core.length > 0) {
          addCoreResult = await Promise.all(
            add.core.map(async (coreDuty) => {
              return await this.addOgdrTransaction(transactionEntityManager, coreDuty, positionId, DutyType.CORE);
            }),
          );
        }

        let addSupportResult = [];
        if (add.core.length > 0)
          addSupportResult = await Promise.all(
            add.support.map(async (supportDuty) => {
              return await this.addOgdrTransaction(transactionEntityManager, supportDuty, positionId, DutyType.SUPPORT);
            }),
          );

        let updateCoreResult = [];

        if (update.core.length > 0) {
          updateCoreResult = await Promise.all(
            update.core.map(async (coreDuty) => {
              if ((await this.updateOgdrTransaction(transactionEntityManager, coreDuty, DutyType.CORE)).affected > 0) return coreDuty;
            }),
          );
        }

        let updateSupportResult = [];
        if (update.support.length > 0) {
          updateSupportResult = await Promise.all(
            update.support.map(async (supportDuty) => {
              if ((await this.updateOgdrTransaction(transactionEntityManager, supportDuty, DutyType.SUPPORT)).affected > 0) return supportDuty;
            }),
          );
        }

        if (update.deleted.length > 0) {
          await this.deleteOgdrTransaction(transactionEntityManager, update.deleted);
          return {
            add: { core: addCoreResult, support: addSupportResult },
            update: {
              updated: {
                core: updateCoreResult,
                support: updateSupportResult,
                deleted: update.deleted,
              },
            },
          };
        }

        return {
          add: { core: addCoreResult, support: addSupportResult },
          update: {
            updated: {
              core: updateCoreResult,
              support: updateSupportResult,
            },
          },
        };
      });
      return updateResult;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @description Remove assigned duties and responsibilities in a selected position
   * @param positionId
   */
  async removeDutiesResponsibilities(positionId: string, ogdrDTO: OgdrDto) {
    const removeResult = await this.entityRepository.query(
      `DELETE FROM 
      occupational_group_duties_responsibilities WHERE (_id IN (?) OR _id IN(?));`,
      [ogdrDTO.core, ogdrDTO.support],
    );

    if (removeResult.affectedRows > 0) return ogdrDTO;
  }

  /**
   * @audience Employee Portal
   *
   * @description Returns the pool of duties and responsibilities of a specific position handled by manager
   * available for setting percentage
   *
   * @param positionId The positionId of the selected Position Title
   */
  async getDRPool(positionId: string) {
    const pool = await this.entityRepository.query(
      `
          SELECT odr._id odrId, dr._id drId, dr.description FROM duties_responsibilities dr 
            INNER JOIN occupations_duties_responsibilities odr ON odr.duties_responsibilities_id_fk = dr._id 
            INNER JOIN occupational_group og ON odr.occupation_id_fk = og.occupation_id_fk 
          WHERE og.position_id_fk = ? AND odr._id NOT IN (
            SELECT odr._id FROM occupational_group_duties_responsibilities ogdr 
            INNER JOIN occupations_duties_responsibilities odr ON odr._id = ogdr.odr_id_fk 
            INNER JOIN occupational_group og ON ogdr.occupational_group_id_fk = og._id 
          WHERE og.position_id_fk = ?
          )
     `,
      [positionId, positionId],
    );
    return pool;
  }

  /**
   * @audience Employee Portal
   *
   * Adds duties and responsibilities to the selected position
   *
   * @param empPositionId The position Id of the manager
   * @param positionId The position id of the position title selected by the manager
   * @param ogdrDTO { core: OccupationalGroupDutiesResponsibilitiesType[], support: OccupationalGroupDutiesResponsibilitiesType[] }
   * @returns -  { core: [{ occupationalGroupId,ogdrId, percentage, dutyType }], support:  [{ occupationalGroupId,ogdrId, percentage, dutyType }] }
   */
  async assignDutiesResponsibilities(empPositionId: string, positionId: string, ogdrDTO: OgdrDto) {
    const og = await this.entityRepository.query('SELECT _id,occupation_id_fk FROM occupational_group WHERE position_id_fk = ?', [positionId]);

    const core = await Promise.all(
      ogdrDTO.core.map(async (ogdr: OccupationalGroupDutiesResponsibilitiesType) => {
        return await this.saveEntity({
          occupationalGroupId: og[0]._id,
          odrId: ogdr.odrId,
          percentage: ogdr.percentage,
          dutyType: 'core',
          pcplId: ogdr.pcplId,
        });
      }),
    );

    const support = await Promise.all(
      ogdrDTO.support.map(async (ogdr: OccupationalGroupDutiesResponsibilitiesType) => {
        return await this.saveEntity({
          occupationalGroupId: og[0]._id,
          odrId: ogdr.odrId,
          percentage: ogdr.percentage,
          dutyType: 'support',
          pcplId: ogdr.pcplId,
        });
      }),
    );

    return { core, support };
  }

  /**
   * @audience - HRMS
   * @description - Get duties and responsibilities for DBM CSC
   */
  async getDutiesAndResponsibilitiesByPositionId(positionId: string, dutyType: DutyType) {
    try {
      return await this.entityRepository.query(
        `
      SELECT percentage, cm.name competencyName, dr.description dutyResponsibility, p.level competencyLevel
            FROM occupational_group_duties_responsibilities ogdr
          INNER JOIN occupations_duties_responsibilities odr ON ogdr.odr_id_fk = odr._id
          INNER JOIN duties_responsibilities dr ON dr._id = odr.duties_responsibilities_id_fk
          INNER JOIN position_competency_proficiency_level pcpl ON pcpl._id = ogdr.pcpl_id_fk
          INNER JOIN proficiency p ON p._id = pcpl.proficiency_id_fk
          INNER JOIN competency_model cm on p.competency_id_fk = cm._id
          INNER JOIN occupational_group og ON og._id = ogdr.occupational_group_id_fk
        WHERE og.position_id_fk = ? AND duty_type=?
        ORDER BY percentage desc, competencyName asc;
      `,
        [positionId, dutyType],
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
