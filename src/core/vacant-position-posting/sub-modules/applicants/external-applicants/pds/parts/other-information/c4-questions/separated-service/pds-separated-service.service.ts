import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSSeparatedService } from './data/entities/pds-separated-service.entity';

@Injectable()
export class PDSSeparatedServiceService extends BaseEntityCrudService<PDSSeparatedService> {
  constructor(@InjectRepository(PDSSeparatedService) pdsSeparatedServiceRepository: Repository<PDSSeparatedService>) {
    super(pdsSeparatedServiceRepository);
  }
}
