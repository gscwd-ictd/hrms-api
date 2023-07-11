import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { HiringProcessResultsView } from './data/hiring-process-results.view';

@Injectable()
export class HiringProcessResultsService extends BaseEntityCrudService<HiringProcessResultsView> {
  constructor(@InjectRepository(HiringProcessResultsView) private readonly hiringProcessResultsViewRepository: Repository<HiringProcessResultsView>) {
    super(hiringProcessResultsViewRepository);
  }
}
