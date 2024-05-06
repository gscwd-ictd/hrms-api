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

  /* find all position under managerd */
  async getPositionsUnderManager(positionId: string) {
    const employeeId = (await this.entityRepository.query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [positionId]))[0].employeeId;
    const oicPositionId = await this.entityRepository.query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    let positions;
    if (oicPositionId.length > 0) positions = (await this.entityRepository.query(`CALL sp_get_positions_under_manager_v2(?);`, [oicPositionId[0].positionId]))[0];
    else positions = (await this.entityRepository.query(`CALL sp_get_positions_under_manager_v2(?);`, [positionId]))[0];
    return positions;
  }

  /* find all permanent positions under manager  */
  async getPermanentPositionsUnderManager(positionId: string) {
    const employeeId = (await getManager().query(`SELECT employee_id_fk employeeId FROM plantilla_positions WHERE _id=?`, [positionId]))[0].employeeId;
    const oicPositionId = await getManager().query(`SELECT get_position_id_by_org_position_id(orgPositionId) positionId FROM officer_in_charge_view WHERE employeeId=?;`, [
      employeeId,
    ]);

    let positions;
    if (oicPositionId.length > 0) positions = (await getManager().query(`CALL sp_get_permanent_positions_under_manager(?);`, [oicPositionId[0].positionId]))[0];
    else positions = (await getManager().query(`CALL sp_get_permanent_positions_under_manager(?);`, [positionId]))[0];
    return positions;
  }

  /* find all unfilled position under manager */
  async getPendingDutiesAndResponsibilities(positionId: string) {
    const positions = await this.getPermanentPositionsUnderManager(positionId);
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
          pv.position_id IN (?) AND pdr.position_competency_proficiency_level_id_fk IN(
              ( SELECT pcplId FROM
              ( SELECT SUM(pdr.percentage) AS percentage, pdr.position_competency_proficiency_level_id_fk pcplId
                  FROM
                      position_duties_responsibilities pdr
                  GROUP BY
                      pdr.position_competency_proficiency_level_id_fk
              ) a
          WHERE
              a.percentage < 100 AND duty_type = 'core'
          )
      UNION
          ( SELECT pcplId FROM
          ( SELECT SUM(pdr.percentage) AS percentage, pdr.position_competency_proficiency_level_id_fk pcplId
              FROM
                  position_duties_responsibilities pdr
              GROUP BY
                  pdr.position_competency_proficiency_level_id_fk
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

  /* find all filled position under manager */
  async getFinishedDutiesAndResponsibilities(positionId: string) {
    const positions = await this.getPermanentPositionsUnderManager(positionId);
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
            pv.position_id IN (?) AND pdr.position_competency_proficiency_level_id_fk IN(
            SELECT pcplId
            FROM
                ( SELECT SUM(pdr.percentage) AS percentage, pdr.position_competency_proficiency_level_id_fk pcplId
                FROM position_duties_responsibilities pdr
                GROUP BY pdr.position_competency_proficiency_level_id_fk
            ) a
        WHERE
            a.percentage >= 100
        )`,
      [positionIds],
    );
  }
}
