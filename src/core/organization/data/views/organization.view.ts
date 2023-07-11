import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'org_struct_view',
  expression: `
(SELECT _id, name FROM divisions)
UNION
(SELECT _id, name FROM departments)
UNION
(SELECT _id, name FROM office)
`,
})
export class OrgStructView {
  @ViewColumn()
  _id: string;

  @ViewColumn()
  name: string;
}
