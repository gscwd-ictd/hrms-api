import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { DepartmentPositions } from 'src/core/organizational-positions/department-positions/data/entities/department-positions.entity';
import { DivisionPositions } from 'src/core/organizational-positions/division-positions/data/dtos/division-positions.entity';
import { OfficePositions } from 'src/core/organizational-positions/office-positions/data/entities/office-positions.entity';

export class OfficerInChargeDTO {
  employeeId: Employees;
  orgPositionId: DepartmentPositions | DivisionPositions | OfficePositions;
  orgType: string;
}
