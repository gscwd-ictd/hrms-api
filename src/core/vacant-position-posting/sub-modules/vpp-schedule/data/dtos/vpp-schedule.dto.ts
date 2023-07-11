import { VppScheduleType } from 'src/core/vacant-position-posting/sub-modules/vpp-schedule/utils/types/vpp-schedule-type.enum';

export class VppScheduleDto {
  _id?: string;
  vppId: string;
  schedule: Date;
  venue: string;
  scheduleType: VppScheduleType;
}

/* 

  @Column({ name: 'schedule' })
  schedule: Date;

  @Column({name: 'venue'})
  venue: string;

  @Column({name: 'schedule_type', type: 'enum', enum: VppScheduleType, default: VppScheduleType.INTERVIEW})
  scheduleType: VppScheduleType;

  */
