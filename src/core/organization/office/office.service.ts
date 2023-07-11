import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { Office } from './data/entities/office.entity';

@Injectable()
export class OfficeService extends BaseEntityCrudService<Office> {
  constructor(@InjectRepository(Office) public readonly officeRepository: Repository<Office>) {
    super(officeRepository);
  }

  async findAllOffice() {
    try {
      return await this.entityRepository
        .createQueryBuilder('office')
        .select('office._id', '_id')
        .addSelect('office.name', 'name')
        .addSelect('office.code', 'code')
        .addSelect('office.description', 'description')
        .orderBy('office.name', 'ASC')
        .getRawMany();
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  }

  async getAllOffice() {
    return await this.entityRepository.query(
      `
        SELECT _id as id, name FROM office ORDER BY name ASC; 
      `,
    );
  }
}
