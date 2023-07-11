import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PositionDescriptionFormWorkingCondition } from './data/working-condition.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PositionDescriptionFormWorkingConditionService extends BaseEntityCrudService<PositionDescriptionFormWorkingCondition> {
  constructor(@InjectRepository(PositionDescriptionFormWorkingCondition) private readonly workingConditionRepository: Repository<PositionDescriptionFormWorkingCondition>) {
    super(workingConditionRepository);
  }

  async getWorkingConditionFrequency(postingApplicantId: string) {
    try {
      return (
        await this.entityRepository.query(
          `
              SELECT 
                    IF(is_office_work IS NOT NULL,IF(is_office_work  = 1, 'Occasional','Frequent'), null) officeWorkFrequency,
                    IF(is_field_work IS NOT NULL,IF(is_field_work = 1, 'Occasional','Frequent'), null) fieldWorkFrequency,
                    others
              FROM position_description_form_working_condition 
              WHERE posting_applicants_id_fk=?`,
          [postingApplicantId],
        )
      )[0];
    } catch (error) {}
  }
}
