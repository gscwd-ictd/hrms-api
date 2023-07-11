import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PrfStatus } from '../../utils/enums/prf-status.enum';

@Entity('prf_details')
export class PrfDetails extends DefaultTable {
  @Column()
  for: string;

  @Column({ name: 'with_exam', type: 'bool' })
  withExam: boolean;

  @Column({ name: '', type: 'enum', enum: PrfStatus, default: PrfStatus.PENDING })
  status: PrfStatus;

  @Column({ name: 'disapproved_remarks', default: '' })
  disapprovedRemarks: string;

  @Column({ name: 'date_requested', type: 'date' })
  dateRequested: Date;

  @Column({ name: 'date_needed', type: 'date', nullable: true })
  dateNeeded: Date;

  @Column({ name: 'prf_no', length: 12 })
  prfNo: string;

  @ManyToOne(() => Employees, (employees) => employees._id)
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: Employees;
}
