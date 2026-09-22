import { PickType } from '@nestjs/swagger';
import { NosiNosaStatus, InactiveReason } from 'src/core/salary-grade/utils/types/salary-grade.type';

export class NosiNosaDto {
  effectivityDate: Date;
  status: NosiNosaStatus;
  employeeId: string;
  positionId: string;
  actualSalaryGradeId: number;
  adjustedSalaryGradeId: number;
  inactiveReason?: InactiveReason;
}

export class ServiceRecordDto extends PickType(NosiNosaDto, ['effectivityDate', 'employeeId', 'positionId', 'status']) {
  actualSalaryGrade: number;
  actualStepIncrement: number;
  actualSgYear: number;
  adjustedSalaryGrade: number;
  adjustedStepIncrement: number;
  adjustedSgYear: number;
}
