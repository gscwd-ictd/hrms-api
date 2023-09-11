import { SalaryGradeType } from '../../utils/types/salary-grade.type';

export class SalaryGradeDto {
  salaryGrade: number;
  stepIncrement: number;
  amount: number;
}

export class SalaryGradeUpdateDTO {
  salaryGradeList: SalaryGradeType[];
}
