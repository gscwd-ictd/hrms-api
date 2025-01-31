import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PositionDutiesResponsibilities } from '../entities/position-duties-responsibilities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { CreatePositionDutiesResponsibilitiesDto, UpdatePositionDutiesResponsibilitiesDto } from '../dtos/position-duties-responsibilities.dto';
import { DutyType } from 'src/core/occupational-group-duties-responsibilities/utils/enums/duty-type.enum';
import { PositionCompetencyProficiencyLevelService } from 'src/core/position-competency-proficiency-level/position-competency-proficiency-level.service';

@Injectable()
export class PositionDutiesResponsibilitiesService extends BaseEntityCrudService<PositionDutiesResponsibilities> {
  constructor(
    @InjectRepository(PositionDutiesResponsibilities) public readonly positionDutiesResponsibilitiesRepository: Repository<PositionDutiesResponsibilities>,
    public readonly positionCompetencyProficiencyLevelService: PositionCompetencyProficiencyLevelService,
  ) {
    super(positionDutiesResponsibilitiesRepository);
  }

  async createPositionDutiesResponsibilities(data: CreatePositionDutiesResponsibilitiesDto) {
    try {
      return await this.positionDutiesResponsibilitiesRepository.manager.transaction(async (transactionManager) => {
        const { positionId, core, support } = data;

        const coreResult = await Promise.all(
          core.map(async (items) => {
            const pdrId = await transactionManager
              .createQueryBuilder()
              .insert()
              .into(PositionDutiesResponsibilities)
              .values({
                pcplId: {
                  _id: items.pcplId,
                },
                duty: items.duty,
                percentage: items.percentage,
                dutyType: DutyType.CORE,
              })
              .execute();

            const competency = await transactionManager
              .createQueryBuilder()
              .select('cm.code', 'code')
              .addSelect('cm.name', 'name')
              .addSelect('cm.desc', 'description')
              .addSelect('pf.key_actions', 'keyActions')
              .addSelect('pf.level', 'level')
              .from(PositionDutiesResponsibilities, 'pdr')
              .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
              .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
              .innerJoin('plantilla_positions', 'pp', 'og.position_id_fk = pp._id')
              .innerJoin('proficiency', 'pf', 'pcpl.proficiency_id_fk = pf._id')
              .innerJoin('competency_model', 'cm', 'pf.competency_id_fk = cm._id')
              .where('pdr._id = :id', { id: pdrId.identifiers[0]._id })
              .getRawOne();

            return {
              pdrId: pdrId.identifiers[0]._id,
              duty: items.duty,
              percentage: items.percentage,
              competency: {
                pcplId: items.pcplId,
                ...competency,
              },
            };
          }),
        );

        const supportResult = await Promise.all(
          support.map(async (items) => {
            const pdrId = await transactionManager
              .createQueryBuilder()
              .insert()
              .into(PositionDutiesResponsibilities)
              .values({
                pcplId: {
                  _id: items.pcplId,
                },
                duty: items.duty,
                percentage: items.percentage,
                dutyType: DutyType.SUPPORT,
              })
              .execute();

            const competency = await transactionManager
              .createQueryBuilder()
              .select('cm.code', 'code')
              .addSelect('cm.name', 'name')
              .addSelect('cm.desc', 'description')
              .addSelect('pf.key_actions', 'keyActions')
              .addSelect('pf.level', 'level')
              .from(PositionDutiesResponsibilities, 'pdr')
              .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
              .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
              .innerJoin('plantilla_positions', 'pp', 'og.position_id_fk = pp._id')
              .innerJoin('proficiency', 'pf', 'pcpl.proficiency_id_fk = pf._id')
              .innerJoin('competency_model', 'cm', 'pf.competency_id_fk = cm._id')
              .where('pdr._id = :id', { id: pdrId.identifiers[0]._id })
              .getRawOne();

            return {
              pdrId: pdrId.identifiers[0]._id,
              duty: items.duty,
              percentage: items.percentage,
              competency: {
                pcplId: items.pcplId,
                ...competency,
              },
            };
          }),
        );

        return {
          positionId: positionId,
          core: coreResult,
          support: supportResult,
        };
      });
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  async updatePositionDutiesResponsibilities(data: UpdatePositionDutiesResponsibilitiesDto) {
    try {
      return await this.positionDutiesResponsibilitiesRepository.manager.transaction(async (transactionManager) => {
        const { positionId, positionDuties, core, support } = data;

        const pdrId = await Promise.all(positionDuties.map(async (items) => items.pdrId));

        const deletePositionDuties = await transactionManager.createQueryBuilder().delete().from(PositionDutiesResponsibilities).where('_id in (:id)', { id: pdrId }).execute();

        if (deletePositionDuties.affected > 0) {
          const coreResult = await Promise.all(
            core.map(async (items) => {
              const pdrId = await transactionManager
                .createQueryBuilder()
                .insert()
                .into(PositionDutiesResponsibilities)
                .values({
                  pcplId: {
                    _id: items.pcplId,
                  },
                  duty: items.duty,
                  percentage: items.percentage,
                  dutyType: DutyType.CORE,
                })
                .execute();

              const competency = await transactionManager
                .createQueryBuilder()
                .select('cm.code', 'code')
                .addSelect('cm.name', 'name')
                .addSelect('cm.desc', 'description')
                .addSelect('pf.key_actions', 'keyActions')
                .addSelect('pf.level', 'level')
                .from(PositionDutiesResponsibilities, 'pdr')
                .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
                .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
                .innerJoin('plantilla_positions', 'pp', 'og.position_id_fk = pp._id')
                .innerJoin('proficiency', 'pf', 'pcpl.proficiency_id_fk = pf._id')
                .innerJoin('competency_model', 'cm', 'pf.competency_id_fk = cm._id')
                .where('pdr._id = :id', { id: pdrId.identifiers[0]._id })
                .getRawOne();

              return {
                pdrId: pdrId.identifiers[0]._id,
                duty: items.duty,
                percentage: items.percentage,
                competency: {
                  pcplId: items.pcplId,
                  ...competency,
                },
              };
            }),
          );

          const supportResult = await Promise.all(
            support.map(async (items) => {
              const pdrId = await transactionManager
                .createQueryBuilder()
                .insert()
                .into(PositionDutiesResponsibilities)
                .values({
                  pcplId: {
                    _id: items.pcplId,
                  },
                  duty: items.duty,
                  percentage: items.percentage,
                  dutyType: DutyType.SUPPORT,
                })
                .execute();

              const competency = await transactionManager
                .createQueryBuilder()
                .select('cm.code', 'code')
                .addSelect('cm.name', 'name')
                .addSelect('cm.desc', 'description')
                .addSelect('pf.key_actions', 'keyActions')
                .addSelect('pf.level', 'level')
                .from(PositionDutiesResponsibilities, 'pdr')
                .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
                .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
                .innerJoin('plantilla_positions', 'pp', 'og.position_id_fk = pp._id')
                .innerJoin('proficiency', 'pf', 'pcpl.proficiency_id_fk = pf._id')
                .innerJoin('competency_model', 'cm', 'pf.competency_id_fk = cm._id')
                .where('pdr._id = :id', { id: pdrId.identifiers[0]._id })
                .getRawOne();

              return {
                pdrId: pdrId.identifiers[0]._id,
                duty: items.duty,
                percentage: items.percentage,
                competency: {
                  pcplId: items.pcplId,
                  ...competency,
                },
              };
            }),
          );

          return {
            positionId: positionId,
            core: coreResult,
            support: supportResult,
          };
        } else {
          return {
            affected: 0,
          };
        }
      });
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  /* find position under supervisor position id */
  async getPositionsUnderManager(supervisorPositionId: string) {
    const employeeId = (await this.entityRepository.query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [supervisorPositionId]))[0].employeeId;
    const oicPositionId = await this.entityRepository.query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    let positions;
    if (oicPositionId.length > 0) positions = (await this.entityRepository.query(`CALL sp_get_positions_under_manager_v2(?);`, [oicPositionId[0].positionId]))[0];
    else positions = (await this.entityRepository.query(`CALL sp_get_positions_under_manager_v2(?);`, [supervisorPositionId]))[0];
    return positions;
  }

  /* find permanent positions under supervisor position id  */
  async getPermanentPositionsUnderManager(supervisorPositionId: string) {
    const employeeId = (await getManager().query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [supervisorPositionId]))[0].employeeId;
    const oicPositionId = await getManager().query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    let positions;
    if (oicPositionId.length > 0) positions = (await getManager().query(`CALL sp_get_permanent_positions_under_manager(?);`, [oicPositionId[0].positionId]))[0];
    else positions = (await getManager().query(`CALL sp_get_permanent_positions_under_manager(?);`, [supervisorPositionId]))[0];
    return positions;
  }

  /* find unfilled position under supervisor position id */
  async getPendingDutiesAndResponsibilities(supervisorPositionId: string) {
    const positions = await this.getPermanentPositionsUnderManager(supervisorPositionId);
    const positionIds = await Promise.all(
      positions.map((position) => {
        return position.positionId;
      }),
    );

    return await this.entityRepository.query(
      `
      SELECT position_id positionId, position_title positionTitle, item_number itemNumber, get_position_assignment(position_id) designation
      FROM
          plantilla_view pv
      INNER JOIN occupational_group og ON og.position_id_fk = pv.position_id
      INNER JOIN position_competency_proficiency_level pcpl ON pcpl.occupational_group_id_fk = og._id
      INNER JOIN position_duties_responsibilities pdr ON pdr.position_competency_proficiency_level_id_fk = pcpl._id
      WHERE
          pv.position_id IN (?) AND og._id IN(
              ( SELECT occupationalGroupId FROM
              ( SELECT SUM(pdr.percentage) AS percentage, og._id occupationalGroupId
                  FROM
                      position_duties_responsibilities pdr
                  INNER JOIN position_competency_proficiency_level pcpl ON pdr.position_competency_proficiency_level_id_fk = pcpl._id
                  INNER JOIN occupational_group og ON pcpl.occupational_group_id_fk = og._id
                  GROUP BY
                      og._id
              ) a
          WHERE
              a.percentage < 100 AND duty_type = 'core'
          )
      UNION
          ( SELECT occupationalGroupId FROM
          ( SELECT SUM(pdr.percentage) AS percentage, og._id occupationalGroupId
              FROM
                  position_duties_responsibilities pdr
              INNER JOIN position_competency_proficiency_level pcpl ON pdr.position_competency_proficiency_level_id_fk = pcpl._id
              INNER JOIN occupational_group og ON pcpl.occupational_group_id_fk = og._id
              GROUP BY
                  og._id
          ) a
      WHERE
          a.percentage < 100 AND duty_type = 'support'
      ))
      UNION
          ( SELECT position_id positionId, position_title positionTitle, item_number itemNumber, get_position_assignment(position_id) designation
          FROM
              plantilla_view pv
          INNER JOIN occupational_group og ON
              og.position_id_fk = pv.position_id
          WHERE
              pv.position_id IN (?) AND og._id NOT IN(
              SELECT position_competency_proficiency_level_id_fk
              FROM
              position_duties_responsibilities
          )
      );
      `,
      [positionIds, positionIds],
    );
  }

  /* find filled position under supervisor position id */
  async getFinishedDutiesAndResponsibilities(supervisorPositionId: string) {
    const positions = await this.getPermanentPositionsUnderManager(supervisorPositionId);
    const positionIds = await Promise.all(
      positions.map((position) => {
        return position.positionId;
      }),
    );

    return await this.entityRepository.query(
      `SELECT DISTINCT position_id positionId, position_title positionTitle, item_number itemNumber, get_position_assignment(position_id) designation,
            DATE_FORMAT(pdr.updated_at, '%Y-%m-%d') updatedAt
        FROM
            plantilla_view pv
        INNER JOIN occupational_group og ON og.position_id_fk = pv.position_id
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.occupational_group_id_fk = og._id
        INNER JOIN position_duties_responsibilities pdr ON pdr.position_competency_proficiency_level_id_fk = pcpl._id
        WHERE
            pv.position_id IN (?) AND og._id IN(
            SELECT occupationalGroupId
            FROM
                ( SELECT SUM(pdr.percentage) AS percentage, og._id occupationalGroupId
                FROM position_duties_responsibilities pdr
                INNER JOIN position_competency_proficiency_level pcpl ON pdr.position_competency_proficiency_level_id_fk = pcpl._id
                INNER JOIN occupational_group og ON pcpl.occupational_group_id_fk = og._id
                GROUP BY og._id
            ) a
        WHERE
            a.percentage >= 100
        )`,
      [positionIds],
    );
  }

  /* find duties and responsibilities by plantilla position id (core and support) */
  async getPositionDutiesResponsibilities(positionId: string) {
    const core = await this.getDutiesAndResponsibilities(positionId, DutyType.CORE);
    const support = await this.getDutiesAndResponsibilities(positionId, DutyType.SUPPORT);

    return {
      positionId: positionId,
      core: core,
      support: support,
    };
  }

  /* find duties and responsibilities by plantilla position id */
  async getDutiesAndResponsibilities(positionId: string, dutyType: DutyType) {
    try {
      const duties = await this.entityRepository
        .createQueryBuilder('pdr')
        .select('pdr._id', 'pdrId')
        .addSelect('pdr.duty', 'duty')
        .addSelect('pdr.percentage', 'percentage')
        .addSelect('cm.name', 'name')
        .addSelect('cm.code', 'code')
        .addSelect('cm.desc', 'competencyDescription')
        .addSelect('p.key_actions', 'keyActions')
        .addSelect('pcpl._id', 'pcplId')
        .addSelect('p.level', 'level')
        .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
        .innerJoin('proficiency', 'p', 'pcpl.proficiency_id_fk = p._id')
        .innerJoin('competency_model', 'cm', 'p.competency_id_fk = cm._id')
        .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
        .innerJoin('plantilla_positions', 'pp', 'og.position_id_fk = pp._id')
        .where('pp._id = :positionId and pdr.duty_type = :dutyType', { positionId, dutyType })
        .execute();

      return await Promise.all(
        duties.map(async (items) => {
          const { pdrId, duty, percentage, level, pcplId, code, name, competencyDescription, keyActions } = items;
          return {
            pdrId: pdrId,
            duty: duty,
            percentage: percentage,
            competency: {
              level: level,
              pcplId: pcplId,
              code: code,
              name: name,
              competencyDescription: competencyDescription,
              keyActions: keyActions,
            },
          };
        }),
      );
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* find all position about duties and responsibilities*/
  async getAllPositionDutiesAndResponsibilities() {
    try {
      return await this.entityRepository
        .createQueryBuilder('pdr')
        .select('pp._id', 'positionId')
        .addSelect('pp.item_number', 'plantillaNumber')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('count(pdr._id)', 'numberOfCoreFunction')
        .addSelect('oc.occupation_name', 'occupationalGroup')
        .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
        .innerJoin('proficiency', 'pf', 'pcpl.proficiency_id_fk = pf._id')
        .innerJoin('competency_model', 'cm', 'pf.competency_id_fk = cm._id')
        .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
        .innerJoin('occupations', 'oc', 'og.occupation_id_fk = oc._id')
        .innerJoin('plantilla_positions', 'pp', 'og.position_id_fk = pp._id')
        .where('pdr.duty_type = :dutyType group by og._id', { dutyType: DutyType.CORE })
        .execute();
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
