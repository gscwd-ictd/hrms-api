import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'all_employees_view',
  expression: `
      SELECT 
        hris_emp._id AS employee_id,
        hris_emp.company_id AS company_id,
        hris_dev1.get_employee_fullname2(hris_emp._id) AS name,
        hris_dev1.get_employee_position_or_oic(hris_emp._id) AS position_title,
        hris_dev1.get_employee_assignment_or_oic(hris_emp._id) AS assignment,
        hris_dev1.get_employee_assignment_id_or_oic_id(hris_emp._id) AS assignmentId,
        port_emp.mobile_number AS mobile_number,
        port_emp.photo_url AS photo_url
    FROM
        (employees hris_emp
        JOIN portal.employees port_emp ON ((hris_emp._id = port_emp.user_id_fk)))
    WHERE
        (hris_dev1.get_employee_position_or_oic(hris_emp._id) IS NOT NULL)
    ORDER BY hris_dev1.get_employee_fullname2(hris_emp._id) ASC;
    `,
})
export class AllEmployeesView {
  @ViewColumn({ name: 'employee_id' })
  employeeId: string;

  @ViewColumn({ name: 'company_id' })
  companyId: string;

  @ViewColumn({ name: 'name' })
  name: string;

  @ViewColumn({ name: 'position_title' })
  positionTitle: string;

  @ViewColumn({ name: 'assignment' })
  assignment: string;

  @ViewColumn({ name: 'mobile_number' })
  mobileNumber: string;

  @ViewColumn({ name: 'photo_url' })
  photoUrl: string;
}
