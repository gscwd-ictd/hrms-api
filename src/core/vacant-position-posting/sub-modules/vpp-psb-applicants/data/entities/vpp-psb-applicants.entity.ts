import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PostingApplicants } from '../../../applicants/data/entities/posting-applicants.entity';
import { VppPsb } from '../../../vpp-psb/data/entities/vpp-psb.entity';

@Entity('vpp_psb_applicants')
export class VppPsbApplicants extends DefaultTable {
  @ManyToOne(() => VppPsb, (vppPsb) => vppPsb._id)
  @JoinColumn({ name: 'vpp_psb_id_fk' })
  vppPsbId: VppPsb;

  @ManyToOne(() => PostingApplicants, (postingApplicants) => postingApplicants._id)
  @JoinColumn({ name: 'posting_applicants_id_fk' })
  postingApplicantsId: PostingApplicants;

  @Column({ type: 'text' })
  remarks: string;

  @Column({ name: 'exam_result' })
  examResult: number;

  @Column({ name: 'interviewed' })
  interviewed: boolean;

  @Column({ name: 'exam_taken' })
  examTaken: boolean;
}
