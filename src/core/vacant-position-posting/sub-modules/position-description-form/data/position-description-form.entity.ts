import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export abstract class PositionDescriptionForm extends DefaultTable {
  @ManyToOne(() => PostingApplicants, (postingApplicants) => postingApplicants._id)
  @JoinColumn({ name: 'posting_applicants_id_fk' })
  postingApplicantId: PostingApplicants;
}
