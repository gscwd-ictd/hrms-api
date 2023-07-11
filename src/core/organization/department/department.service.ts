import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { Departments } from './data/entities/departments.entity';

@Injectable()
export class DepartmentService extends BaseEntityCrudService<Departments> {
  constructor(@InjectRepository(Departments) public departmentRepository: Repository<Departments>) {
    super(departmentRepository);
  }

  async findAllDepartments() {
    return await this.departmentRepository
      .createQueryBuilder('department')
      .select('department._id', '_id')
      .addSelect('department.name', 'name')
      .addSelect('department.code', 'code')
      .addSelect('department.description', 'description')
      .addSelect('department.office_id_fk', 'officeId')
      .addSelect('office.code', 'officeCode')
      .innerJoin('office', 'office', 'office._id = department.office_id_fk')
      .orderBy('department.name', 'ASC')
      .printSql()
      .getRawMany();
  }

  async getAllDepartments() {
    return await this.entityRepository.query(
      `
        SELECT _id as id, name FROM departments ORDER BY name ASC; 
      `,
    );
  }
}
