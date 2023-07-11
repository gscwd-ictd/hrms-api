import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { VppScheduleType } from 'src/core/vacant-position-posting/sub-modules/vpp-schedule/utils/types/vpp-schedule-type.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('vpp_schedule')
export class VppSchedule extends DefaultTable {
  @ManyToOne(() => VacantPositionPosting, (vpp) => vpp._id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'vacant_position_posting_id_fk' })
  vppId: VacantPositionPosting;

  @Column({ name: 'schedule' })
  schedule: Date;

  @Column({ name: 'venue' })
  venue: string;

  @Column({ name: 'schedule_type', type: 'enum', enum: VppScheduleType, default: VppScheduleType.INTERVIEW })
  scheduleType: VppScheduleType;
}
