import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { PrfPositionsDTO } from '../../prf-positions/data/dto/prf-positions.dto';
import { PrfStatus } from '../../utils/enums/prf-status.enum';

export class PrfDetailsDTO {
  for: string;
  withExam: boolean;
  status: PrfStatus;
  dateRequested: Date;
  employeeId: Employees;
  prfPositions: PrfPositionsDTO[];
  dateNeeded: Date;
  prfNo: string;
}

export class UpdatePrfDetailsDto {
  _id: string;
  status?: PrfStatus;
}
