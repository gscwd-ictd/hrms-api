import { NosiNosaStatus } from 'src/core/salary-grade/utils/types/salary-grade.type';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'nosi_nosa_view',
  expression: `
      SELECT * FROM ((SELECT 
		nn._id _id,
        nn.employee_id_fk AS employeeId,
        get_employee_fullname2(nn.employee_id_fk) AS employeeName,
        pp._id positionId,
        pp.position_title AS positionTitle,
        nn.effectivity_date AS effectivityDate,
        sg_actual._id AS actualId,
        sg_actual.salary_grade AS actualSalaryGrade,
        sg_actual.step_increment AS actualStepIncrement,
        sg_actual.amount AS actualAmount,
        sg_adjusted._id AS adjustedId,
        sg_adjusted.salary_grade AS adjustedSalaryGrade,
        sg_adjusted.step_increment AS adjustedStepIncrement,
        sg_adjusted.amount AS adjustedAmount,
        nn.rate rate,
        nn.status AS status
     FROM
        (((nosi_nosa nn
        INNER JOIN salary_grade sg_actual ON ((sg_actual._id = nn.actual_salary_grade_id_fk)))
        INNER JOIN salary_grade sg_adjusted ON ((sg_adjusted._id = nn.adjusted_salary_grade_id_fk)))
        INNER JOIN plantilla_positions pp ON ((pp._id = nn.position_id_fk)))
    ) UNION (
		SELECT 
        nn._id,
        nn.employee_id_fk AS employeeId,
        get_employee_fullname2(nn.employee_id_fk) AS employeeName,
        pp._id positionId,
        pp.position_title AS positionTitle,
        nn.effectivity_date AS effectivityDate,
        null AS actualId,
        null AS actualSalaryGrade,
        null AS actualStepIncrement,
        null AS actualAmount,
        null AS adjustedId,
        null AS adjustedSalaryGrade,
        null AS adjustedStepIncrement, 
        null AS adjustedAmount,
        nn.rate rate,
        nn.status AS status
    FROM
        (((nosi_nosa nn
        INNER JOIN plantilla_positions pp ON ((pp._id = nn.position_id_fk))
       )))
	  WHERE nn.rate is not null
    )) serviceRecord ORDER BY serviceRecord.employeeName ASC;
    `,
})
export class NosiNosaView {
  @ViewColumn({ name: '_id' })
  _id: string;

  @ViewColumn({ name: 'employeeId' })
  employeeId: string;

  @ViewColumn({ name: 'employeeName' })
  employeeName: string;

  @ViewColumn({ name: 'positionId' })
  positionId: string;

  @ViewColumn({ name: 'positionTitle' })
  positionTitle: string;

  @ViewColumn({ name: 'effectivityDate' })
  effectivityDate: Date;

  @ViewColumn({ name: 'actualId' })
  actualSalaryGradeId: number;

  @ViewColumn({ name: 'actualSalaryGrade' })
  actualSalaryGrade: string;

  @ViewColumn({ name: 'actualAmount' })
  actualSalaryGradeAmount: number;

  @ViewColumn({ name: 'actualStepIncrement' })
  actualStepIncrement: string;

  @ViewColumn({ name: 'adjustedId' })
  adjustedSalaryGradeId: number;

  @ViewColumn({ name: 'actualSalaryGrade' })
  adjustedSalaryGrade: string;

  @ViewColumn({ name: 'actualStepIncrement' })
  adjustedStepIncrement: string;

  @ViewColumn({ name: 'adjustedAmount' })
  adjustedSalaryGradeAmount: number;

  @ViewColumn({ name: 'status' })
  status: NosiNosaStatus;
}
