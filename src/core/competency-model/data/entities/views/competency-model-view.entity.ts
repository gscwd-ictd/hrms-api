import { ViewEntity, ViewColumn, Connection } from 'typeorm';
import { CompetencyModel } from '../competency-model.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('competency_model.name', 'name')
      .addSelect('competency_model.code', 'code')
      .addSelect('competency_model.domain_id_fk', 'domain_id')
      .distinct(true)
      .addSelect('competency_model.desc', 'desc')
      .addSelect('occ.occupation_name', 'occupationName')
      .from(CompetencyModel, 'competency_model')
      .innerJoin('domain', 'domain', 'domain._id=competency_model.domain_id_fk')
      .innerJoin('proficiency', 'prof', 'prof.competency_id_fk = competency_model._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl.proficiency_id_fk = prof._id')
      .innerJoin('occupational_group', 'og', 'og._id = pcpl.occupational_group_id_fk')
      .innerJoin('occupations', 'occ', 'occ._id = og.occupation_id_fk'),
})
export class CompetencyModelView {
  @ViewColumn()
  name: string;

  @ViewColumn()
  domainId: string;

  @ViewColumn()
  code: string;

  @ViewColumn()
  desc: string;

  @ViewColumn()
  occupationName: string;
}
