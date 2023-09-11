import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { OfficePositions } from './data/entities/office-positions.entity';

@Injectable()
export class OfficePositionsService extends BaseEntityCrudService<OfficePositions> {
  constructor(@InjectRepository(OfficePositions) private readonly officePositionsRepository: Repository<OfficePositions>) {
    super(officePositionsRepository);
  }

  async getAllOfficePositions() {
    return '';
  }
}
