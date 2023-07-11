import { Column, Entity } from 'typeorm';
import { PositionDescriptionForm } from '../../../../data/position-description-form.entity';

@Entity('position_description_form_external_contacts')
export class PositionDescriptionFormExternalContacts extends PositionDescriptionForm {
  @Column({ name: 'general_public_is_occasional', type: 'boolean', nullable: true })
  generalPublicIsOccasional: boolean;

  @Column({ name: 'other_agencies_is_occasional', type: 'boolean', nullable: true })
  otherAgenciesIsOccasional: boolean;

  @Column({ type: 'text' })
  others: string;
}
