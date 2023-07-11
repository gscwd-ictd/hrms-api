import { WorkExperienceSheetDuties } from './data/duties.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WorkExperienceSheetDutiesService extends BaseEntityCrudService<WorkExperienceSheetDuties> {
  constructor(@InjectRepository(WorkExperienceSheetDuties) workExperienceSheetDutiesRepository: Repository<WorkExperienceSheetDuties>) {
    super(workExperienceSheetDutiesRepository);
  }
}
