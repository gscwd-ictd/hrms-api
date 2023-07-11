import { DivisionPositions } from 'src/core/organizational-positions/division-positions/data/dtos/division-positions.entity';
import { DepartmentPositions } from 'src/core/organizational-positions/department-positions/data/entities/department-positions.entity';
import { OfficePositions } from 'src/core/organizational-positions/office-positions/data/entities/office-positions.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'officer_in_charge' })
export class OfficerInCharge extends DefaultTable {
  @JoinColumn({ name: 'employee_id_fk' })
  @OneToOne(() => Employees, (employee) => employee._id)
  employeeId: Employees;

  @JoinColumn({ name: 'office_positions_id_fk' })
  @OneToOne(() => OfficePositions, (officePositions) => officePositions._id)
  officePositionId: OfficePositions;

  @JoinColumn({ name: 'department_positions_id_fk' })
  @OneToOne(() => DepartmentPositions, (departmentPositions) => departmentPositions._id)
  departmentPositionId: DepartmentPositions;

  @JoinColumn({ name: 'division_positions_id_fk' })
  @OneToOne(() => DivisionPositions, (divisionPositions) => divisionPositions._id)
  divisionPositionId: DivisionPositions;
}
