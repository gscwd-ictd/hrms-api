import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSOfficeRelation } from './data/entities/pds-office-relation.entity';

@Injectable()
export class PDSOfficeRelationService extends BaseEntityCrudService<PDSOfficeRelation> {
  constructor(@InjectRepository(PDSOfficeRelation) pdsOfficeRelation: Repository<PDSOfficeRelation>) {
    super(pdsOfficeRelation);
  }
}
