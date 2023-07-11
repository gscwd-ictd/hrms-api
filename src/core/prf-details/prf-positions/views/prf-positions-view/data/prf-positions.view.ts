import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'prf_positions_view',
  expression: `
    SELECT prfd._id prfDetailsId, count(prfp.position_id_fk) countPositionId,GROUP_CONCAT(prfp.position_id_fk) AS positionId,pp.position_title positionTitle, get_position_assignment(prfp.position_id_fk) positionAssignment, o.occupation_name occupationName FROM prf_positions prfp 
	INNER JOIN occupational_group og ON og.position_id_fk = prfp.position_id_fk
    INNER JOIN plantilla_positions pp ON pp._id = og.position_id_fk
    INNER JOIN occupations o ON o._id = og.occupation_id_fk
    INNER JOIN prf_details prfd ON prfd._id = prfp.prf_details_id_fk
GROUP BY prfDetailsId, positionTitle, positionAssignment, occupationName;`,
})
export class PrfPositionsView {
  @ViewColumn()
  prfDetailsId: string;

  @ViewColumn()
  countPositionId: string;

  @ViewColumn()
  positionId: string;

  @ViewColumn()
  positionTitle: string;

  @ViewColumn()
  positionAssignment: string;

  @ViewColumn()
  occupationName: string;
}
