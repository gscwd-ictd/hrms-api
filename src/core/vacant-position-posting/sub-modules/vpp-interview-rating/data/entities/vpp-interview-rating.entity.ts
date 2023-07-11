import { PositionCompetencyProficiencyLevel } from 'src/core/position-competency-proficiency-level/data/entities/position-competency-proficiency-level.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DefaultTable } from '../../../../../base-entity/data/base.entity';
import { PostingApplicants } from '../../../applicants/data/entities/posting-applicants.entity';
import { PostingApplicantsDetailedView } from '../../../applicants/data/views/posting-applicants-detailed-view/data/posting-applicants-detailed.view';
import { VppPsb } from '../../../vpp-psb/data/entities/vpp-psb.entity';

@Entity()
export class VppInterviewRating extends DefaultTable {
  //TODO: employees and outsiders
  @ManyToOne(() => PositionCompetencyProficiencyLevel, (pcpl) => pcpl._id)
  @JoinColumn({ name: 'pcpl_id_fk' })
  pcplId: string;

  @JoinColumn({ name: 'posting_applicants_id_fk' })
  @ManyToOne(() => PostingApplicants, (postingApplicants) => postingApplicants._id)
  postingApplicantId: string;

  @Column()
  rating: number;

  @ManyToOne(() => VppPsb, (vppPsb) => vppPsb._id)
  @JoinColumn({ name: 'vpp_psb_id_fk' })
  vppPsbId: string;
}
