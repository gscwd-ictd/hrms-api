import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { PostingApplicants } from '../../applicants/data/entities/posting-applicants.entity';

@Entity('applicant_selection')
export class ApplicantSelection extends DefaultTable {
  @OneToOne(() => PostingApplicants, (postingApplicants) => postingApplicants._id)
  @JoinColumn({ name: 'posting_applicants_id_fk' })
  postingApplicantId: PostingApplicants;

  @Column({ nullable: true, default: null })
  remarks: string;
}
