import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { VppPositions } from './data/entities/vpp-positions.entity';

@Injectable()
export class VppPositionsService extends BaseEntityCrudService<VppPositions> {
  constructor(@InjectRepository(VppPositions) vppPositionsRepository: Repository<VppPositions>) {
    super(vppPositionsRepository);
  }
}
