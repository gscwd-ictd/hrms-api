import { BaseEntity, ManyToOne, ViewColumn, ViewEntity } from 'typeorm';

//#region original view query
/* */
//#endregion original view query

@ViewEntity({
  name: 'plantilla_dropdown_view',
  expression: `
  ((SELECT divisions.code \`code\`, division_positions.position_id_fk \`position_id\` FROM divisions
  INNER JOIN division_positions ON division_positions.division_id_fk = divisions._id			
)
 UNION 
(SELECT departments.code \`code\`, department_positions.position_id_fk \`position_id\` FROM departments 
  INNER JOIN department_positions ON department_positions.department_id_fk = departments._id	
)
  UNION 
(SELECT office.code \`code\`, office_positions.position_id_fk \`position_id\` FROM office INNER JOIN office_positions ON office_positions.office_id_fk = office._id ))
  `,
})
export class PlantillaDropDownView {
  @ViewColumn({ name: 'code' })
  code: string;

  @ViewColumn({ name: 'position_id' })
  positionId: string;
}
