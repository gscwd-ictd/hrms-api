import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'officer_in_charge_view',
  expression: `
  SELECT _id,
    employee_id_fk employeeId,
    get_employee_fullname(employee_id_fk) employeeFullName,
    get_org_name_by_org_position_id(COALESCE(oic.office_positions_id_fk, oic.department_positions_id_fk, oic.division_positions_id_fk)) oicOrgName,
    COALESCE(oic.office_positions_id_fk, oic.department_positions_id_fk, oic.division_positions_id_fk) orgPositionId,
    get_role_by_org_position_id(COALESCE(oic.office_positions_id_fk, oic.department_positions_id_fk, oic.division_positions_id_fk)) oicPosition,
    get_employee_position(employee_id_fk) employeePosition,
    get_employee_assignment(employee_id_fk) employeeOrg
  FROM officer_in_charge oic ORDER BY oic.created_at ASC;
    `,
})
export class OfficerInChargeView {
  @ViewColumn()
  _id: string;

  @ViewColumn()
  employeeId: string;

  @ViewColumn()
  employeeFullName: string;

  @ViewColumn()
  oicOrgName: string;

  @ViewColumn()
  orgPositionId: string;

  @ViewColumn()
  oicPosition: string;

  @ViewColumn()
  employeePosition: string;

  @ViewColumn()
  employeeOrg: string;
}
