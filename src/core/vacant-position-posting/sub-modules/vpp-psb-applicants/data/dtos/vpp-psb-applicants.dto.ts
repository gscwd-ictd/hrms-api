import { PostingApplicants } from '../../../applicants/data/entities/posting-applicants.entity';
import { VppPsb } from '../../../vpp-psb/data/entities/vpp-psb.entity';

export class VppPsbApplicantsDTO {
  vppPsbId?: VppPsb;
  postingApplicantsId?: PostingApplicants;
  remarks?: string;
  examResult?: number;
  interviewed?: boolean;
  examTaken?: boolean;
}
