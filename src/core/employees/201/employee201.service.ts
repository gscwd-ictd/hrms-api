import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Employee201 } from './entities/employee201.entity';
import { Repository } from 'typeorm';

@Injectable()
export class Employee201Service extends BaseEntityCrudService<Employee201> {
  constructor(
    @InjectRepository(Employee201)
    private readonly employee201Repository: Repository<Employee201>,
  ) {
    super(employee201Repository);
  }

  async getEmployee201(employeeId: string) {
    return '';
  }
}
