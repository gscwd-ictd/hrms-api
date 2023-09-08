import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { Entity, JoinColumn, Column, OneToOne } from 'typeorm';
import { PDSEducation } from '../../../data/entities/pds-education.entity';

@Entity({ name: 'pds_education_secondary' })
export class PDSEducationSecondary extends PDSEducation {
  @OneToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;

  @Column()
  degree: string;

  @Column()
  units: string;
}
