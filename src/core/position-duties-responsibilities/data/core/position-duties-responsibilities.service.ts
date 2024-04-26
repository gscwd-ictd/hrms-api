import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PositionDutiesResponsibilities } from '../entities/position-duties-responsibilities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
        const { plantillaPositionId, core, support } = data;

        const coreResult = await Promise.all(
          core.map(async (items) => {
            const pdrId = await transactionManager
              .createQueryBuilder()
              .insert()
              .into(PositionDutiesResponsibilities)
              .values({
                plantillaPositionId: {
                  _id: plantillaPositionId,
                },
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
              .addSelect('cm.desc', 'description')
              .addSelect('pf.key_actions', 'keyActions')
              .addSelect('cm.name', 'name')
              .from(PositionDutiesResponsibilities, 'pdr')
              .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
              .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
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
                plantillaPositionId: {
                  _id: plantillaPositionId,
                },
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
              .addSelect('cm.desc', 'description')
              .addSelect('pf.key_actions', 'keyActions')
              .addSelect('cm.name', 'name')
              .from(PositionDutiesResponsibilities, 'pdr')
              .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
              .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
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
          plantillaPositionId: plantillaPositionId,
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
        const { plantillaPositionId, positionDuties, core, support } = data;

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
                  plantillaPositionId: {
                    _id: plantillaPositionId,
                  },
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
                .addSelect('cm.desc', 'description')
                .addSelect('pf.key_actions', 'keyActions')
                .addSelect('cm.name', 'name')
                .from(PositionDutiesResponsibilities, 'pdr')
                .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
                .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
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
                  plantillaPositionId: {
                    _id: plantillaPositionId,
                  },
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
                .addSelect('cm.desc', 'description')
                .addSelect('pf.key_actions', 'keyActions')
                .addSelect('cm.name', 'name')
                .from(PositionDutiesResponsibilities, 'pdr')
                .innerJoin('position_competency_proficiency_level', 'pcpl', 'pdr.position_competency_proficiency_level_id_fk = pcpl._id')
                .innerJoin('occupational_group', 'og', 'pcpl.occupational_group_id_fk = og._id')
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
            plantillaPositionId: plantillaPositionId,
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
}
