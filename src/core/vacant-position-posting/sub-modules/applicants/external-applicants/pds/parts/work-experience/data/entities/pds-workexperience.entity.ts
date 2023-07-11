import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExternalApplicants } from '../../../../../data/entities/external-applicants.entity';
import { AppointmentStatus } from '../../../../utils/enums/pds.enum';

@Entity({ name: 'pds_work_experience' })
export class PDSWorkExperience extends DefaultTable {
  @Column({ name: 'position_title' })
  positionTitle: string;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'monthly_salary' })
  monthlySalary: number;

  @Column({ name: 'appointment_status', type: 'enum', enum: AppointmentStatus })
  appointmentStatus: AppointmentStatus;

  @Column({ name: 'is_government_service', type: 'boolean' })
  isGovernmentService: boolean;

  @Column({ name: 'salary_grade', nullable: true })
  salaryGrade: string;

  @Column({ nullable: true, type: 'date' })
  from: Date;

  @Column({ nullable: true, type: 'date' })
  to: Date;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
