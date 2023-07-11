import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'posting_applicants_detailed_view',
  expression: `
  SELECT 
    vacant_position_posting_id_fk AS vppId,
    vacant_position_posting.posting_date postingDate,
    vacant_position_posting.posting_status postingStatus, 
    vacant_position_posting.posting_deadline postingDeadline,
    vacant_position_posting.effectivity_date effectivityDate,
    posting_applicants._id postingApplicantId, 
    COALESCE(employee_id_fk, external_applicant_id_fk) AS applicantId,
    COALESCE(get_employee_fullname(employee_id_fk), get_applicant_fullname(external_applicant_id_fk)) as applicantName, 
    COALESCE(get_employee_fullname2(employee_id_fk), get_applicant_fullname2(external_applicant_id_fk)) as applicantName2, 
    COALESCE(get_employee_name(employee_id_fk,'firstname'), get_applicant_name(external_applicant_id_fk,'firstname')) as applicantFirstName, 
    COALESCE(get_employee_name(employee_id_fk,'middlename'), get_applicant_name(external_applicant_id_fk,'middlename')) as applicantMiddleName, 
    COALESCE(get_employee_name(employee_id_fk,'lastname'), get_applicant_name(external_applicant_id_fk,'lastname')) as applicantLastName, 
    COALESCE(get_employee_name(employee_id_fk,'nameextension'), get_applicant_name(external_applicant_id_fk,'nameextension')) as applicantNameExtension, 
    IF(employee_id_fk IS NULL,'external','internal') applicantType, 
    IF(IF(employee_id_fk IS NULL,'external','internal') = 'internal',get_employee_position(employee_id_fk),'N/A') AS positionTitle,
    IF(IF(employee_id_fk IS NULL,'external','internal') = 'internal',get_employee_assignment(employee_id_fk),'N/A') AS assignedTo,
    applicant_status applicantStatus,
    posting_applicants.exam_score examScore
  FROM posting_applicants 
      INNER JOIN vacant_position_posting ON posting_applicants.vacant_position_posting_id_fk = vacant_position_posting._id    
  ORDER BY applicantType ASC;`,
})
export class PostingApplicantsDetailedView {
  @ViewColumn()
  vppId: string;

  @ViewColumn()
  postingDate: Date;

  @ViewColumn()
  postingStatus: string;

  @ViewColumn()
  postingDeadline: Date;

  @ViewColumn()
  postingApplicantId: string;

  @ViewColumn()
  effectivityDate: Date;

  @ViewColumn()
  applicantId: string;

  @ViewColumn()
  applicantName: string;

  @ViewColumn()
  applicantName2: string;

  @ViewColumn()
  applicantType: string;

  @ViewColumn()
  applicantStatus: string;

  @ViewColumn()
  positionTitle: string;

  @ViewColumn()
  assignedTo: string;

  @ViewColumn()
  examScore: number;
}
