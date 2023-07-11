import { WorkExperienceSheetAccomplishments } from './data/accomplishments.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WorkExperienceSheetAccomplishmentsService extends BaseEntityCrudService<WorkExperienceSheetAccomplishments> {
  constructor(@InjectRepository(WorkExperienceSheetAccomplishments) private readonly workExperienceSheetAccomplishmentsRepository: Repository<WorkExperienceSheetAccomplishments>) {
    super(workExperienceSheetAccomplishmentsRepository);
  }
}
