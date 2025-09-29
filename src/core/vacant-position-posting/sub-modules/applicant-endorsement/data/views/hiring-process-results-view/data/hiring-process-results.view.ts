import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `
  SELECT DISTINCT 
  padv.vppId vppId,
  vpppv.positionTitle positionTitle,
  vpppv.itemNumber plantillaNumber, 
  get_position_assignment(vpppv.positionId) assignedTo, 
  vpppv.salaryGradeLevel,
  padv.postingDate postingDate,
  vpps.schedule psbDate,
  GROUP_CONCAT(DISTINCT padv.applicantName SEPARATOR ', \n') selected 
  FROM vacant_position_posting_publication_view vpppv 
      INNER JOIN posting_applicants_detailed_view padv ON padv.vppId = vpppv.vppId 
      INNER JOIN applicant_endorsement ae ON padv.postingApplicantId = ae.posting_applicant_id_fk 
      INNER JOIN vpp_schedule vpps ON vpppv.vppId = vpps.vacant_position_posting_id_fk 
  WHERE ae.status = 'Selected by appointing authority' AND vpps.schedule_type = 'interview' 
  GROUP BY positionTitle,assignedTo, vpppv.positionId,padv.postingDate,psbDate,vppId, plantillaNumber, salaryGradeLevel;
`,
})
export class HiringProcessResultsView {
  @ViewColumn()
  vppId: string;

  @ViewColumn()
  positionTitle: string;

  @ViewColumn()
  postingDate: Date;

  @ViewColumn()
  psbDate: Date;

  @ViewColumn()
  selected: string;
}
