import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { OrganizationalEntity } from 'src/core/organization/data/entities/organization.entity';
import { Divisions } from 'src/core/organization/division/data/entities/divisions.entity';
import { Office } from 'src/core/organization/office/data/entities/office.entity';
import { DepartmentPositions } from 'src/core/organizational-positions/department-positions/data/entities/department-positions.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'departments' })
export class Departments extends OrganizationalEntity {
  @ManyToOne(() => Employees, (employees) => employees._id)
  @JoinColumn({ name: 'oic_employee_id_fk' })
  oicEmployeeId: Employees;

  @OneToMany(() => Divisions, (division) => division.departmentId)
  divisions: Divisions[];

  @OneToMany(() => DepartmentPositions, (deptPositions) => deptPositions.departmentId)
  deptPositions: DepartmentPositions[];

  @JoinColumn({ name: 'office_id_fk' })
  @ManyToOne(() => Office, (office) => office._id, { onUpdate: 'CASCADE' })
  officeId: Office;
}
