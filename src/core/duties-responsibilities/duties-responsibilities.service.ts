import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { DutiesResponsibilitiesDTO } from './data/dto/duties-responsibilities.dto';
import { DutiesResponsibilities } from './data/entities/duties-resposibilities.entity';

@Injectable()
export class DutiesResponsibilitiesService extends BaseEntityCrudService<DutiesResponsibilities> {
  constructor(@InjectRepository(DutiesResponsibilities) private readonly dutiesResponsibilitiesRepository: Repository<DutiesResponsibilities>) {
    super(dutiesResponsibilitiesRepository);
  }

  async getPool() {
    try {
      return await this.entityRepository.find({ select: ['_id', 'description'], order: { description: 'ASC' } });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  /**
   * Add a single Duties and Responsibilities data to the general pool.
   * @param dutiesResponsibilitiesDTO
   */
  async addDutiesResponsibilites(dutiesResponsibilitiesDTO: DutiesResponsibilitiesDTO) {
    try {
      return await this.saveEntity(dutiesResponsibilitiesDTO);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async updateDutiesResponsibilities(dutiesResponsibilitiesId: string, dutiesResponsibilitiesDTO: DutiesResponsibilitiesDTO) {
    try {
      const updateResult = await this.entityRepository
        .createQueryBuilder()
        .update()
        .set(dutiesResponsibilitiesDTO)
        .where('_id = :dutiesResponsibilitiesId', { dutiesResponsibilitiesId })
        .execute();
      if (updateResult.affected > 0) {
        return { dutiesResponsibilitiesId, ...dutiesResponsibilitiesDTO };
      }
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async removeDutiesResponsibilities(dutiesResponsibilitiesId: string) {
    try {
      return await this.removeEntity(dutiesResponsibilitiesId);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
