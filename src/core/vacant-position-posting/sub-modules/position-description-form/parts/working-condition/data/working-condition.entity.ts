import { Entity, Column } from 'typeorm';
import { PositionDescriptionForm } from '../../../data/position-description-form.entity';

@Entity('position_description_form_working_condition')
export class PositionDescriptionFormWorkingCondition extends PositionDescriptionForm {
  @Column({ name: 'is_office_work', nullable: true })
  isOfficeWork: boolean;

  @Column({ name: 'is_field_work', nullable: true })
  isFieldWork: boolean;

  @Column({ type: 'text' })
  others: string;
}
