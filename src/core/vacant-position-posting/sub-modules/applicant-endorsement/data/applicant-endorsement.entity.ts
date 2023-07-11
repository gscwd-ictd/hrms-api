import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PostingApplicants } from '../../applicants/data/entities/posting-applicants.entity';
import { ApplicantEndorsementStatus } from '../utils/types/applicant-endorsement.enum';

@Entity('applicant_endorsement')
export class ApplicantEndorsement extends DefaultTable {
  @OneToOne(() => PostingApplicants, (postingApplicants) => postingApplicants._id)
  @JoinColumn({ name: 'posting_applicant_id_fk' })
  postingApplicantId: PostingApplicants;

  @Column({ type: 'enum', enum: ApplicantEndorsementStatus, default: ApplicantEndorsementStatus.ENDORSED })
  status: ApplicantEndorsementStatus;

  @Column({ type: 'datetime', name: 'requesting_entity_selection_date', nullable: true })
  requestingEntitySelectionDate: Date;

  @Column({ type: 'datetime', name: 'appointing_authority_selection_date', nullable: true })
  appointingAuthoritySelectionDate: Date;
}
