import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { EmployeeTemporaryAssignmentStatus } from 'src/global/utils/enums/employee-temporary-assignment.enum';
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'employee-temporary-assignment' })
export class EmployeeTemporaryAssignment extends DefaultTable {
  @ManyToOne(() => Employees, (employee) => employee._id, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'employee_id_fk' })
  employee: Employees;

  @Column({ name: 'organization_id_fk', type: 'uuid', nullable: false })
  organizationId: string;

  @Column({ name: 'date_from', type: 'date', nullable: false })
  dateFrom: Date;

  @Column({ name: 'date_to', type: 'date', nullable: false })
  dateTo: Date;

  @Column({ name: 'status', type: 'enum', enum: EmployeeTemporaryAssignmentStatus, default: EmployeeTemporaryAssignmentStatus.ACTIVE })
  status: EmployeeTemporaryAssignmentStatus;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
