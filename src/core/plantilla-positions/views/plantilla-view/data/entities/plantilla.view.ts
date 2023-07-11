import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'plantilla_view',
  expression: `
  SELECT a._id as position_id,  a.item_number,get_occupation_by_position_id(a._id) occupation_name, a.position_title, b.code as assigned_to,h._id as salary_grade_id, h.salary_grade , h.step_increment , h.amount as actual_salary, a.nature_of_appointment, c.summary
  FROM plantilla_positions a, office b, office_positions c, salary_grade h, occupations, occupational_group
  WHERE 
      a._id = c.position_id_fk AND 
      b._id = c.office_id_fk AND
      a.salary_grade_id_fk = h._id AND
      a._id = occupational_group.position_id_fk AND
      occupational_group.occupation_id_fk = occupations._id
  UNION 
      SELECT a._id, a.item_number, get_occupation_by_position_id(a._id) occupation_name, a.position_title, d.code,h._id as salary_grade_id, h.salary_grade, h.step_increment, h.amount as actual_salary,  a.nature_of_appointment, e.summary
      FROM plantilla_positions a, departments d, department_positions e, salary_grade h, occupations, occupational_group
      WHERE 
          a._id = e.position_id_fk AND
          d._id = e.department_id_fk AND
          a.salary_grade_id_fk = h._id AND
      a._id = occupational_group.position_id_fk AND
      occupational_group.occupation_id_fk = occupations._id 
  UNION 
      SELECT a._id, a.item_number, get_occupation_by_position_id(a._id) occupation_name, a.position_title, f.code,h._id as salary_grade_id, h.salary_grade, h.step_increment, h.amount as actual_salary,  a.nature_of_appointment, g.summary
      FROM plantilla_positions a, divisions f, division_positions g, salary_grade h, occupations, occupational_group
      WHERE 
          a._id = g.position_id_fk AND
          f._id = g.division_id_fk AND
          a.salary_grade_id_fk = h._id AND
      a._id = occupational_group.position_id_fk AND
      occupational_group.occupation_id_fk = occupations._id 
  ORDER BY position_id ASC;
            `,
})
export class PlantillaView {
  @ViewColumn({ name: 'position_id' })
  positionId: string;

  @ViewColumn({ name: 'item_number' })
  itemNumber: number;

  @ViewColumn({ name: 'position_title' })
  positionTitle: string;

  @ViewColumn({ name: 'occupation_name' })
  occupationName: string;

  @ViewColumn({ name: 'assigned_to' })
  assignedTo: string;

  @ViewColumn({ name: 'salary_grade_id' })
  salaryGradeId: number;

  @ViewColumn({ name: 'salary_grade' })
  salaryGrade: number;

  @ViewColumn({ name: 'step_increment' })
  stepIncrement: number;

  @ViewColumn({ name: 'actual_salary' })
  actualSalary: number;

  @ViewColumn({ name: 'nature_of_appointment' })
  natureOfAppointment: string;

  @ViewColumn({ name: 'summary' })
  summary: string;
}
