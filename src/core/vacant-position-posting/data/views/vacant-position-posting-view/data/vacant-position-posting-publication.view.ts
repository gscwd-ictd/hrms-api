import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'vacant_position_posting_publication_view',
  expression: `
  SELECT vpp._id vppId, 
  vpp.posting_date postingDate, 
  vpp.posting_deadline postingDeadline, 
  GROUP_CONCAT(pp._id) positionId,
  pp.position_title as positionTitle, 
  pp.item_number itemNumber,
  COUNT(pp._id) numberOfPositions,
  get_plantilla_salary_grade(pp._id) salaryGradeLevel,
  CONCAT('P ',FORMAT(get_salary_grade_amount( get_salary_grade_id_by_position_id(pp._id) ),2),' / SG-',get_plantilla_salary_grade(pp._id)) salaryGrade, 
  FORMAT(get_salary_grade_amount( get_salary_grade_id_by_position_id(pp._id) )*12,2) AS annualSalary, 
  qs.education education, 
  qs.training training, 
  qs.eligibility eligibility, 
  qs.experience experience, 
  get_position_assignment(pp._id) AS placeOfAssignment,
  o.occupation_name AS occupationName, 
  prfd.prf_no AS prfNo,
  prfd._id AS prfId, 
  prfd.with_exam AS withExam,
  vpp.posting_status postingStatus 
      FROM plantilla_positions pp
      INNER JOIN qualification_standards qs ON qs.position_id_fk = pp._id 
      INNER JOIN vpp_positions vppp ON vppp.prf_positions_positions_id_fk = pp._id
      INNER JOIN vacant_position_posting vpp ON vpp._id = vppp.vacant_position_posting_id_fk 
      INNER JOIN occupational_group og ON og.position_id_fk = pp._id 
      INNER JOIN occupations o ON og.occupation_id_fk = o._id 
      INNER JOIN prf_positions prfp ON prfp.position_id_fk = vppp.prf_positions_positions_id_fk
      INNER JOIN prf_details prfd ON prfd._id = prfp.prf_details_id_fk
  WHERE prfd.status <> 'Cancelled' AND prfd.status <> 'Disapproved' 
  GROUP BY vppId,positionTitle,salaryGradeLevel,salaryGrade,education,experience,eligibility,training, postingDate, postingDeadline,annualSalary, placeOfAssignment,occupationName, prfNo,prfId, withExam, postingStatus, item_number`,
})
export class VacantPositionPostingPublicationView {
  @ViewColumn()
  vppId: string;

  @ViewColumn()
  postingDate: Date;

  @ViewColumn()
  numberOfPositions: number;

  @ViewColumn()
  postingDeadline: Date;

  @ViewColumn()
  positionId: string;

  @ViewColumn()
  positionTitle: string;

  @ViewColumn()
  itemNumber: string;

  @ViewColumn()
  salaryGrade: string;

  @ViewColumn()
  annualSalary: string;
  l;
  @ViewColumn()
  education: string;

  @ViewColumn()
  training: string;

  @ViewColumn()
  eligibility: string;

  @ViewColumn()
  experience: string;

  @ViewColumn()
  placeOfAssignment: string;

  @ViewColumn()
  occupationName: string;

  @ViewColumn()
  prfNo: string;

  @ViewColumn()
  prfId: string;

  @ViewColumn()
  postingStatus: string;
}
