import { PositionDescriptionFormInternalContacts } from './data/internal-contacts.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PositionDescriptionFormInternalContactsService extends BaseEntityCrudService<PositionDescriptionFormInternalContacts> {
  constructor(@InjectRepository(PositionDescriptionFormInternalContacts) positionDescriptionFormInternalContactsRepository: Repository<PositionDescriptionFormInternalContacts>) {
    super(positionDescriptionFormInternalContactsRepository);
  }
  async getInternalContactFrequency(postingApplicantId: string) {
    try {
      return (
        await this.entityRepository.query(
          `
            SELECT 
              IF(executive_is_occasional IS NOT NULL,IF( executive_is_occasional = 1, 'Occasional','Frequent' ),null) executiveFrequency,
              IF(supervisors_is_occasional IS NOT NULL,IF( supervisors_is_occasional = 1, 'Occasional','Frequent' ),null) supervisorsFrequency, 
              IF(non_supervisors_is_occasional IS NOT NULL,IF( non_supervisors_is_occasional = 1, 'Occasional','Frequent' ),null) nonSupervisorsFrequency,
              IF(staff_is_occasional IS NOT NULL,IF( staff_is_occasional = 1, 'Occasional','Frequent' ),null) staffFrequency
              FROM position_description_form_internal_contacts
            WHERE posting_applicants_id_fk = ? 
          `,
          [postingApplicantId],
        )
      )[0];
    } catch (error) {}
  }
}
