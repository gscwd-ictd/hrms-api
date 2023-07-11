import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DefaultTable } from '../../../../../base-entity/data/base.entity';

@Entity({ name: 'vpp_psb' })
export class VppPsb extends DefaultTable {
  @ManyToOne(() => VacantPositionPosting, (vpp) => vpp._id)
  @JoinColumn({ name: 'vacant_position_posting_id_fk' })
  vppId: VacantPositionPosting;

  @ManyToOne(() => Employees, (employees) => employees._id)
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: string;

  @Column({ name: 'psb_no', nullable: true })
  psbNo: number;

  @Column({ type: 'boolean' })
  done: boolean;

  @Column({ name: 'acknowledged_schedule', type: 'boolean', default: false })
  acknowledgedSchedule: boolean;

  @Column({ name: 'date_acknowledged', type: 'datetime', nullable: true })
  dateAcknowledged: Date;

  @Column({ name: 'declined_schedule', type: 'boolean', default: false })
  declinedSchedule: boolean;

  @Column({ name: 'decline_reason', type: 'text', nullable: true })
  declineReason: string;

  @Column({ nullable: true, type: 'text' })
  recommendation: string;

  @Column({ name: 'recommendation_date', type: 'date', nullable: true })
  recommendationDate: Date;
}
