import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { VppPsbDTO } from '../../sub-modules/vpp-psb/data/dtos/vpp-psb.dto';
import { PostingStatus } from '../../utils/enums/posting-status.enum';

export class VacantPositionPostingDTO {
  assignedPSBMembers?: VppPsbDTO[];

  postingDate?: Date;

  postingDeadline?: Date;

  postingStatus: PostingStatus;

  effectivityDate?: Date;
}

export class VppEffectivityDateDTO {
  effectivityDate: Date;
}
