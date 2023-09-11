import { PickType } from '@nestjs/swagger';
import { VppSchedule } from '../../../vpp-schedule/data/entities/vpp-schedule.entity';

export class VppPsbDTO {
  vppId: string;
  employeeId: string;
  psbNo: number;
  done: boolean;
  acknowledgedSchedule?: boolean;
  declinedSchedule?: boolean;
  declineReason?: string;
  recommendation?: string;
  recommendationDate?: Date;
  dateAcknowledged: Date;
}
export type VppRecommendation = Pick<VppPsbDTO, 'recommendation'>;
export type VppAcknowledgement = Pick<VppPsbDTO, 'declineReason' | 'dateAcknowledged'>;
export class VppPsbSwapDto extends PickType(VppPsbDTO, ['vppId', 'psbNo', 'employeeId']) {}
