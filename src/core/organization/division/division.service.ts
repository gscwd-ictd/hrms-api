import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { Divisions } from './data/entities/divisions.entity';

@Injectable()
export class DivisionService extends BaseEntityCrudService<Divisions> {
  constructor(@InjectRepository(Divisions) public readonly divisionRepository: Repository<Divisions>) {
    super(divisionRepository);
  }

  async findAllDivisions() {
    return this.divisionRepository
      .createQueryBuilder('division')
      .select('division._id', '_id')
      .addSelect('division.name', 'name')
      .addSelect('division.code', 'code')
      .addSelect('division.description', 'description')
      .addSelect('division.department_id_fk', 'departmentId')
      .addSelect('dept.code', 'departmentCode')
      .innerJoin('departments', 'dept', 'dept._id = division.department_id_fk')
      .orderBy('division.name', 'ASC')
      .printSql()
      .getRawMany();
  }

  async getAllDivisions() {
    return await this.entityRepository.query(
      `
        SELECT _id as id, name FROM divisions ORDER BY name ASC; 
      `,
    );
  }
}
