import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PrfPositionsView } from './data/prf-positions.view';

@Injectable()
export class PrfPositionsViewService extends BaseEntityCrudService<PrfPositionsView> {
  constructor(@InjectRepository(PrfPositionsView) prfPositionsViewRepository: Repository<PrfPositionsView>) {
    super(prfPositionsViewRepository);
  }
}
