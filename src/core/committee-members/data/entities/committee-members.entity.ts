import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Committees } from 'src/core/committees/data/entities/committees.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'committee_members' })
@Index(['committeeId', 'employeeId'], { unique: true })
export class CommitteeMembers extends DefaultTable {
  @ManyToOne(() => Committees, (committees) => committees._id)
  @JoinColumn({ name: 'committee_id_fk' })
  committeeId: Committees;

  @ManyToOne(() => Employees, (employees) => employees._id)
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: Employees;

  @Column({ name: 'committee_role', nullable: true })
  committeeRole: string;

  @Column({ name: 'role_description', type: 'text', nullable: true })
  roleDescription: string;
}
