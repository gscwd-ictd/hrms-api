import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { DepartmentPositions } from './data/entities/department-positions.entity';

@Injectable()
export class DepartmentPositionService extends BaseEntityCrudService<DepartmentPositions> {
  constructor(@InjectRepository(DepartmentPositions) departmentPositionsRepository: Repository<DepartmentPositions>) {
    super(departmentPositionsRepository);
  }
}
