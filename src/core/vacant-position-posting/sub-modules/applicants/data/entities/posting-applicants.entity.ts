import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { ExternalApplicants } from '../../external-applicants/data/entities/external-applicants.entity';
import { ApplicantStatus } from '../../utils/enums/applicant-status.enum';

@Entity({ name: 'posting_applicants' })
export class PostingApplicants extends DefaultTable {
  @ManyToOne(
    () => VacantPositionPosting,
    (vacantPositionPosting) => {
      return vacantPositionPosting._id;
    },
  )
  @JoinColumn({ name: 'vacant_position_posting_id_fk' })
  vacantPositionPostingId: string;

  @ManyToOne(() => Employees, (employees) => employees._id, { nullable: true })
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: Employees;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id, { nullable: true })
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: string;

  @Column({ name: 'applicant_status', type: 'enum', enum: ApplicantStatus, nullable: true, default: ApplicantStatus.FOR_REVIEW })
  applicantStatus: ApplicantStatus;

  @Column({ name: 'exam_score', type: 'decimal', precision: 5, scale: 2 })
  examScore: number;

  @Column({ name: 'with_relevant_experience', type: 'boolean', default: null })
  withRelevantExperience: boolean;
}
