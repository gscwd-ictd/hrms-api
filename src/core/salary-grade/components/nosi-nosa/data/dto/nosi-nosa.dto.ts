import { NosiNosaStatus } from 'src/core/salary-grade/utils/types/salary-grade.type';

export class NosiNosaDto {
  effectivityDate: Date;
  status: NosiNosaStatus;
  employeeId: string;
  positionId: string;
  actualSalaryGradeId: number;
  adjustedSalaryGradeId: number;
}
