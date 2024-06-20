import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PositionDescriptionForm } from '../../../data/position-description-form.entity';
import { AppointmentType, BasicFormNatureOfAppointment, PublicationMode, Supervisor, WorkStation } from '../../../utils/enums/position-description-form.enum';
import { ViceType } from '../utils/vice-type.enum';

@Entity('position_description_form_basic')
export class PositionDescriptionFormBasic extends PositionDescriptionForm {
  @Column({ name: 'immediate_supervisor', type: 'enum', enum: Supervisor, nullable: true })
  immediateSupervisor: Supervisor;

  @Column({ name: 'supervisor_next_higher', type: 'enum', enum: Supervisor, nullable: true })
  supervisorNextHigher: Supervisor;

  @Column({ name: 'item_number' })
  itemNumber: string;

  @Column({ name: 'workstation', type: 'enum', enum: WorkStation, default: WorkStation.OFFICE })
  workStation: WorkStation;

  @Column({ name: 'tools_used', type: 'text' })
  toolsUsed: string;

  @Column({ name: 'appointment_type', type: 'enum', enum: AppointmentType })
  appointmentType: AppointmentType;

  @Column({ name: 'employment_period_from', nullable: true })
  employmentPeriodFrom: Date;

  @Column({ name: 'employment_period_to', nullable: true })
  employmentPeriodTo: Date;

  @Column({ name: 'directly_supervised', nullable: true })
  directlySupervised: string;

  @Column({ name: 'directly_supervised_item_numbers', nullable: true })
  directlySupervisedItemNumbers: string;

  @Column({ name: 'publication_mode', type: 'enum', enum: PublicationMode, nullable: false })
  publicationMode: PublicationMode;

  @Column({ name: 'present_appropriation_act', type: 'varchar', nullable: true })
  presentAppropriationAct: string;

  @Column({ name: 'previous_appropriation_act', type: 'varchar', nullable: true })
  previousAppropriationAct: string;

  @Column({ name: 'nature_of_appointment', type: 'enum', enum: BasicFormNatureOfAppointment, nullable: false })
  appointment: BasicFormNatureOfAppointment;

  @Column({ name: 'certified_by', type: 'uuid', nullable: false })
  certifiedBy: string;

  @Column({ name: 'vice', type: 'varchar', nullable: true })
  vice: string;

  @Column({ name: 'vice_type', type: 'enum', enum: ViceType, nullable: true })
  viceType: ViceType;

  @Column({ name: 'field_page', type: 'text', nullable: false })
  fieldPage: string;
}
