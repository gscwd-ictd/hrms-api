import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'pds_government_issued_id' })
export class PDSGovernmentIssuedId extends DefaultTable {
  @Column({ name: 'issued_id' })
  issuedId: string;

  @Column({ name: 'id_number' })
  idNumber: string;

  @Column({ name: 'issue_date', nullable: true })
  issueDate: Date;

  @Column({ name: 'issue_place' })
  issuePlace: string;

  @OneToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
