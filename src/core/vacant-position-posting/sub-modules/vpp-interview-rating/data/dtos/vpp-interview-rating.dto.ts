import { VppInterviewRatingType } from '../../utils/vpp-interview-rating.type';

export class VppInterviewRatingUpdateDTO {
  remarks: string;
  ratings: VppInterviewRatingType[];
}
