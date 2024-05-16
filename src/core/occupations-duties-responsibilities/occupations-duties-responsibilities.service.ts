import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import {
  CreateOccupationDutiesResponsibilitiesDto,
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
      const deleteResult = await this.entityRepository.query('DELETE FROM occupations_duties_responsibilities WHERE _id IN (?);', [odrDto.odrIds]);
      if (deleteResult.affectedRows > 0) {
        return { deleted: odrDto };
      }
    } catch (error) {
      console.log(error);
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
    } catch (error) {}
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
      Logger.error(error);
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }
}
