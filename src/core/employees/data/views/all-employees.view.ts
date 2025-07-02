import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'all_employees_view',
  expression: `
     SELECT
            hris_emp._id employee_id,
            hris_emp.company_id company_id,
            hris_dev1.get_employee_fullname2(hris_emp._id) name,
            hris_dev1.get_employee_position_or_oic(hris_emp._id) position_title,
            hris_dev1.get_employee_assignment_or_oic(hris_emp._id) assignment,
            port_emp.mobile_number mobile_number,
            port_emp.photo_url photo_url
        FROM hris_dev1.employees hris_emp
        INNER JOIN portal.employees port_emp ON hris_emp._id=port_emp.user_id_fk
        WHERE hris_dev1.get_employee_position_or_oic(hris_emp._id) IS NOT NULL ORDER BY hris_dev1.get_employee_fullname2(hris_emp._id) ASC
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
