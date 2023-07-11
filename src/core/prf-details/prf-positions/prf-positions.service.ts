import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PrfPositions } from './data/entity/prf-positions.entity';

@Injectable()
export class PrfPositionsService extends BaseEntityCrudService<PrfPositions> {
  constructor(@InjectRepository(PrfPositions) prfPositionsRepository: Repository<PrfPositions>) {
    super(prfPositionsRepository);
  }
}
