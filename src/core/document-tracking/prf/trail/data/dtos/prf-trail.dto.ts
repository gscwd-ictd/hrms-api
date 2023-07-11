import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { PrfTrailStatus } from '../../utils/enums/prf-trail-status.enum';

export class PrfTrailDTO {
  prfDetailsId: string;
  status: PrfTrailStatus;
  employeeId: Employees;
  remarks: string;
}
