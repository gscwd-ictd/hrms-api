import { SalaryGradeType } from '../../utils/types/salary-grade.type';

export class SalaryGradeDto {
  salaryGrade: number;
  stepIncrement: number;
  amount: number;
}

export class CreateSalaryGradeDto {
  salaryGradeList: Array<SalaryGradeDto>;
}

export class SalaryGradeUpdateDTO {
  salaryGradeList: SalaryGradeType[];
}
