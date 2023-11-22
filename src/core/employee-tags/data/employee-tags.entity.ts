import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'employee_tags' })
@Unique('employee_id_tag_id_unique', ['employeeId', 'tagId'])
export class EmployeeTags extends DefaultTable {
  @JoinColumn({ name: 'employee_id_fk' })
  @ManyToOne(() => Employees, (employees) => employees._id)
  employeeId: Employees;

  @Column({ name: 'tag_id_fk' })
  tagId: string;
}
