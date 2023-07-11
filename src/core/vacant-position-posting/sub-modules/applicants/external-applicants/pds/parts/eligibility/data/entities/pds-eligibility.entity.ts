import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExternalApplicants } from '../../../../../data/entities/external-applicants.entity';

@Entity({ name: 'pds_eligibility' })
export class PDSEligibility extends DefaultTable {
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rating: number;

  @Column({ name: 'exam_date' })
  examDate: string;

  @Column({ name: 'exam_place' })
  examPlace: string;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @Column({ name: 'validity', nullable: true })
  validity: Date;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
