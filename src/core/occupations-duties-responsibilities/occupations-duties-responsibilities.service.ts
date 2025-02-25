import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository, getManager } from 'typeorm';
import {
  CreateOccupationDutiesResponsibilitiesDto,
  DeleteOccupationDutiesResponsibilitiesDto,
  OccupationDutiesResponsibilitiesDeleteDTO,
  OccupationDutiesResponsibilitiesDTO,
} from './data/dtos/occupations-duties-responsibilities.dto';
import { OccupationsDutiesResponsibilities } from './data/entities/occupations-duties-responsibilities.entity';
import { DutiesResponsibilities } from '../duties-responsibilities/data/entities/duties-resposibilities.entity';

@Injectable()
export class OccupationsDutiesResponsibilitiesService extends BaseEntityCrudService<OccupationsDutiesResponsibilities> {
  constructor(
    @InjectRepository(OccupationsDutiesResponsibilities)
    public readonly odrRepo: Repository<OccupationsDutiesResponsibilities>,
  ) {
    super(odrRepo);
  }

  async assignDRtoOccupation(occupationId: string, odrDto: OccupationDutiesResponsibilitiesDTO) {
    try {
      const assignedDutiesResponsibilities = await Promise.all(
        odrDto.dutyResponsibilityIds.map(async (dutyResponsibility) => {
          return await this.saveEntity({ occupationId, dutiesResponsibilities: dutyResponsibility });
        }),
      );
      return assignedDutiesResponsibilities;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getODRPerOccupation(occupationId: string) {
    try {
      return await this.odrRepo
        .createQueryBuilder('odr')
        .select('odr._id', 'odrId')
        .addSelect('odr.duties_responsibilities_id_fk', 'drId')
        .addSelect('dr.description', 'description')
        .innerJoin('duties_responsibilities', 'dr', 'dr._id = odr.duties_responsibilities_id_fk')
        .where('odr.occupation_id_fk=:occupationId', { occupationId })
        .getRawMany();
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  /**
   *
   * @param odrDto
   * @returns
   */
  async removeDRfromOccupation(odrDto: OccupationDutiesResponsibilitiesDeleteDTO) {
    try {
      // dungagan nalang ug validation

      // icheck kung naa na sa occupational group duties responsibilities
      // kung wala delete sa duties and responsibilities
      // ug delete sa occupations duties and responsibilities

      // kung naa
      const deleteResult = await this.entityRepository.query('DELETE FROM occupations_duties_responsibilities WHERE _id IN (?);', [odrDto.odrIds]);
      if (deleteResult.affectedRows > 0) {
        return { deleted: odrDto };
      }
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') throw new HttpException('Duty is already assigned to a position', HttpStatus.FORBIDDEN);
    }
  }

  /**
   *
   * @param occupationId
   * @returns
   */
  async getAvailableDutiesResponsibilities(occupationId: string) {
    try {
      const availableDutiesResponsibilities = await this.odrRepo.query(
        `SELECT _id as dutyResponsibilityId, description 
        FROM duties_responsibilities WHERE _id NOT IN (SELECT duties_responsibilities_id_fk FROM occupations_duties_responsibilities WHERE occupation_id_fk=?) ORDER BY description ASC;`,
        [occupationId],
      );
      const optionItems = await Promise.all(
        availableDutiesResponsibilities.map(async (dutyResponsibility) => {
          const dots = dutyResponsibility.description.length < 150 ? '' : '...';
          return {
            label: dutyResponsibility.description.substring(0, 149) + dots,
            value: {
              dutyResponsibilityId: dutyResponsibility.dutyResponsibilityId,
              description: dutyResponsibility.description,
            },
          };
        }),
      );
      return [{ options: optionItems }];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /* insert duty and responsibility, then assign them to the occupation group. */
  async createOccupationsDutiesResponsibilities(occupationGroupId: string, data: CreateOccupationDutiesResponsibilitiesDto) {
    try {
      return await this.entityRepository.manager.transaction(async (entityManager) => {
        const dutiesResponsibilitiesId = await entityManager.createQueryBuilder().insert().into(DutiesResponsibilities).values(data).execute();

        const occupationDutiesResponsibilitiesId = await entityManager
          .createQueryBuilder()
          .insert()
          .into(OccupationsDutiesResponsibilities)
          .values({
            occupationId: {
              _id: occupationGroupId,
            },
            dutiesResponsibilities: {
              _id: dutiesResponsibilitiesId.identifiers[0]._id,
            },
          })
          .execute();

        return await entityManager
          .createQueryBuilder()
          .select('ogdr._id', 'id')
          .addSelect('ogdr.occupation_id_fk', 'occupationId')
          .addSelect('ogdr.duties_responsibilities_id_fk', 'dutiesResponsibilitiesId')
          .addSelect('dr.description', 'description')
          .addSelect('ogdr.created_at', 'createdAt')
          .addSelect('ogdr.updated_at', 'updatedAt')
          .from('occupations_duties_responsibilities', 'ogdr')
          .innerJoin('duties_responsibilities', 'dr', 'dr._id = ogdr.duties_responsibilities_id_fk')
          .where('ogdr._id = :id ', { id: occupationDutiesResponsibilitiesId.identifiers[0]._id })
          .getRawOne();
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /* remove occupation duties and responsibilities */
  async deleteOccupationsDutiesResponsibilities(occupationId: string, data: DeleteOccupationDutiesResponsibilitiesDto) {
    try {
      const { odrId, drId } = data;
      const countOgdrId = await getManager()
        .createQueryBuilder()
        .select('count(odr_id_fk)', 'count')
        .from('occupational_group_duties_responsibilities', 'ogdr')
        .where('ogdr.odr_id_fk = :id', { id: odrId })
        .getRawOne();

      if (countOgdrId.count > 0) throw new HttpException('Duty is already assigned in occupational group.', HttpStatus.CONFLICT);

      const deleteOdrId = await getManager().createQueryBuilder().delete().from('occupations_duties_responsibilities').where('_id = :id', { id: odrId }).execute();

      if (deleteOdrId.affected === 0) throw new HttpException('Occupations duties responsibilities id not found.', HttpStatus.NOT_FOUND);

      const deleteDrId = await getManager().createQueryBuilder().delete().from('duties_responsibilities').where('_id = :id', { id: drId }).execute();

      if (deleteDrId.affected === 0) throw new HttpException('Duties responsibilities id not found.', HttpStatus.NOT_FOUND);

      return deleteDrId;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
