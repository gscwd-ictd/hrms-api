import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
import { WorkExperienceSheetBasic } from './data/basic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WorkExperienceSheetBasicService extends BaseEntityCrudService<WorkExperienceSheetBasic> {
  constructor(@InjectRepository(WorkExperienceSheetBasic) private readonly workExperienceSheetBasicRepository: Repository<WorkExperienceSheetBasic>) {
    super(workExperienceSheetBasicRepository);
  }
}
