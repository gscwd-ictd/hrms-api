import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'org_struct_view',
  expression: `
  SELECT _id,name,code,org_struct orgStruct 
  FROM 
  ((SELECT _id, name,code,'division' org_struct FROM divisions)
  UNION
  (SELECT _id, name,code,'department' org_struct FROM departments)
  UNION
  (SELECT _id, name,code, 'office' org_struct FROM office)) org 
  ORDER BY orgStruct ASC,name ASC;
`,
})
export class OrgStructView {
  @ViewColumn()
  _id: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  code: string;

  @ViewColumn()
  orgStruct: string;
}
