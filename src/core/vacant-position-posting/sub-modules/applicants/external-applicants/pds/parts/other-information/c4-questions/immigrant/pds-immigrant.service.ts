import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSImmigrant } from './data/entities/pds-immigrant.entity';

@Injectable()
export class PDSImmigrantService extends BaseEntityCrudService<PDSImmigrant> {
  constructor(@InjectRepository(PDSImmigrant) pdsImmigrantRepository: Repository<PDSImmigrant>) {
    super(pdsImmigrantRepository);
  }
}
