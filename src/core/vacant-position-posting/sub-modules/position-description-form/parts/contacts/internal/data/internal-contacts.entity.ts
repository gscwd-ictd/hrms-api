import { Column, Entity } from 'typeorm';
import { PositionDescriptionForm } from '../../../../data/position-description-form.entity';

@Entity('position_description_form_internal_contacts')
export class PositionDescriptionFormInternalContacts extends PositionDescriptionForm {
  @Column({ name: 'executive_is_occasional', nullable: true })
  executiveIsOccasional: boolean;

  @Column({ name: 'supervisors_is_occasional', nullable: true })
  supervisorIsOccasional: boolean;

  @Column({ name: 'non_supervisors_is_occasional', nullable: true })
  nonSupervisorIsOccasional: boolean;

  @Column({ name: 'staff_is_occasional', nullable: true })
  staffIsOccasional: boolean;
}
