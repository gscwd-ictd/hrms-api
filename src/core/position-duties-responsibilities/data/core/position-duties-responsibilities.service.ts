import { Injectable } from '@nestjs/common';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PositionDutiesResponsibilities } from '../entities/position-duties-responsibilities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PositionDutiesResponsibilitiesService extends BaseEntityCrudService<PositionDutiesResponsibilities> {
  constructor(@InjectRepository(PositionDutiesResponsibilities) public positionDutiesResponsibilitiesRepository: Repository<PositionDutiesResponsibilities>) {
    super(positionDutiesResponsibilitiesRepository);
  }
}
