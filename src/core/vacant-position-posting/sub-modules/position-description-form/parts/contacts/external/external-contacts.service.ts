import { PositionDescriptionFormExternalContacts } from './data/external-contacts.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PositionDescriptionFormExternalContactsService extends BaseEntityCrudService<PositionDescriptionFormExternalContacts> {
  constructor(
    @InjectRepository(PositionDescriptionFormExternalContacts)
    private readonly positionDescriptionFormExternalContactsRepository: Repository<PositionDescriptionFormExternalContacts>,
  ) {
    super(positionDescriptionFormExternalContactsRepository);
  }
  async getExternalContactFrequency(postingApplicantId: string) {
    try {
      return (
        await this.entityRepository.query(
          `
                SELECT 
                      IF(general_public_is_occasional IS NOT NULL,IF(general_public_is_occasional = 1, 'Occasional','Frequent'), null) generalPublicFrequency,
                      IF(other_agencies_is_occasional IS NOT NULL,IF(other_agencies_is_occasional = 1, 'Occasional','Frequent'), null) otherAgenciesFrequency,
                      others
                FROM position_description_form_external_contacts 
                WHERE posting_applicants_id_fk=?`,
          [postingApplicantId],
        )
      )[0];
    } catch (error) {}
  }
}
