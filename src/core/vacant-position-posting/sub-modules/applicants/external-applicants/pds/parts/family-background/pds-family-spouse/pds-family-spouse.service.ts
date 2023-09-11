import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSFamilySpouse } from './data/entities/pds-family-spouse.entity';

@Injectable()
export class PDSFamilySpouseService extends BaseEntityCrudService<PDSFamilySpouse> {
  constructor(@InjectRepository(PDSFamilySpouse) pdsFamilySpouse: Repository<PDSFamilySpouse>) {
    super(pdsFamilySpouse);
  }
}
