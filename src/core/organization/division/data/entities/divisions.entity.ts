import e from 'express';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { OrganizationalEntity } from 'src/core/organization/data/entities/organization.entity';
import { Departments } from 'src/core/organization/department/data/entities/departments.entity';
import { DivisionPositions } from 'src/core/organizational-positions/division-positions/data/dtos/division-positions.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'divisions' })
export class Divisions extends OrganizationalEntity {
  @ManyToOne(() => Employees, (employees) => employees._id)
  @JoinColumn({ name: 'oic_employee_id_fk' })
  oicEmployeeId: Employees;

  @JoinColumn({ name: 'department_id_fk' })
  @ManyToOne(() => Departments, (department) => department._id, { onUpdate: 'CASCADE' })
  departmentId: Departments;

  @OneToMany(() => DivisionPositions, (divPos) => divPos.divisionId)
  divisionPosition: DivisionPositions[];
}
