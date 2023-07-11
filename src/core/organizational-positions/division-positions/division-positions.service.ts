import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { DivisionPositions } from './data/dtos/division-positions.entity';

@Injectable()
export class DivisionPositionsService extends BaseEntityCrudService<DivisionPositions> {
  constructor(@InjectRepository(DivisionPositions) divisionPositionsRepository: Repository<DivisionPositions>) {
    super(divisionPositionsRepository);
  }
}
