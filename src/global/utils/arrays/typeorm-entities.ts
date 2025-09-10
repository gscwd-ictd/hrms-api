import { UserLogs } from './../../user-logs/data/user-logs.entity';
import { UserRoles } from './../../../core/user-roles/data/user-roles.entity';
import { Modules } from './../../../core/user-roles/hrms-modules/data/modules.entity';
import { WorkExperienceSheetDuties } from './../../../core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/parts/work-experience-sheet/contents/duties/data/duties.entity';
import { WorkExperienceSheetBasic } from './../../../core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/parts/work-experience-sheet/contents/basic/data/basic.entity';
import { WorkExperienceSheetAccomplishments } from './../../../core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/parts/work-experience-sheet/contents/accomplishments/data/accomplishments.entity';
import { OfficerInCharge } from './../../../core/officer-in-charge/data/officer-in-charge.entity';
import { PositionDescriptionFormWorkingCondition } from './../../../core/vacant-position-posting/sub-modules/position-description-form/parts/working-condition/data/working-condition.entity';
import { PositionDescriptionFormInternalContacts } from '../../../core/vacant-position-posting/sub-modules/position-description-form/parts/contacts/internal/data/internal-contacts.entity';
import { PositionDescriptionFormExternalContacts } from './../../../core/vacant-position-posting/sub-modules/position-description-form/parts/contacts/external/data/external-contacts.entity';
import { PositionDescriptionFormBasic } from './../../../core/vacant-position-posting/sub-modules/position-description-form/parts/basic/data/position-description-form-basic.entity';
import { HiringProcessResultsView } from '../../../core/vacant-position-posting/sub-modules/applicant-endorsement/data/views/hiring-process-results-view/data/hiring-process-results.view';
import { ApplicantEndorsement } from './../../../core/vacant-position-posting/sub-modules/applicant-endorsement/data/applicant-endorsement.entity';
import { Domain } from 'src/core/domain/data/entities/domain.entity';
import { Proficiency } from 'src/core/proficiency/data/entities/proficiency.entity';
import { QualificationStandards } from 'src/core/qualification-standards/data/entities/qualification-standards.entity';
import { SalaryGrade } from 'src/core/salary-grade/data/entities/salary-grade.entity';
import { Users } from 'src/core/users/data/entities/users.entity';
import { PlantillaView } from 'src/core/plantilla-positions/views/plantilla-view/data/entities/plantilla.view';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { PlantillaDropDownView } from 'src/core/plantilla-positions/views/plantilla-dropdown.view';
import { PrfEntities } from 'src/core/prf-details/utils/arrays/prf-entities';
import { CommitteeMembers } from 'src/core/committee-members/data/entities/committee-members.entity';
import { CompetencyModelOccupation } from 'src/core/competency-model-occupation/data/entities/competency-model-occupation.entity';
import { CompetencyModel } from 'src/core/competency-model/data/entities/competency-model.entity';
import { CompetencyModelView } from 'src/core/competency-model/data/entities/views/competency-model-view.entity';
import { Committees } from 'src/core/committees/data/entities/committees.entity';
import { Occupation } from 'src/core/occupation/data/entities/occupation.entity';
import { OccupationalGroupDutiesResponsibilities } from 'src/core/occupational-group-duties-responsibilities/data/entities/occupational-group-duties-responsibilities.entity';
import { OccupationalGroup } from 'src/core/occupational-group/data/entities/occupational-group.entity';
import { OccupationsDutiesResponsibilities } from 'src/core/occupations-duties-responsibilities/data/entities/occupations-duties-responsibilities.entity';
import { Departments } from 'src/core/organization/department/data/entities/departments.entity';
import { Divisions } from 'src/core/organization/division/data/entities/divisions.entity';
import { Office } from 'src/core/organization/office/data/entities/office.entity';
import { DepartmentPositions } from 'src/core/organizational-positions/department-positions/data/entities/department-positions.entity';
import { DivisionPositions } from 'src/core/organizational-positions/division-positions/data/dtos/division-positions.entity';
import { OfficePositions } from 'src/core/organizational-positions/office-positions/data/entities/office-positions.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { PdsEntities } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/utils/arrays/pds';
import { PositionCompetencyProficiencyLevel } from 'src/core/position-competency-proficiency-level/data/entities/position-competency-proficiency-level.entity';
import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { VppInterviewRating } from 'src/core/vacant-position-posting/sub-modules/vpp-interview-rating/data/entities/vpp-interview-rating.entity';
import { VppSchedule } from 'src/core/vacant-position-posting/sub-modules/vpp-schedule/data/entities/vpp-schedule.entity';
import { SuperUser } from 'src/core/users/data/entities/superuser.entity';
import { PrfTrail } from 'src/core/document-tracking/prf/trail/data/entities/prf-trail.entity';
import { DutiesResponsibilities } from 'src/core/duties-responsibilities/data/entities/duties-resposibilities.entity';
import { VppPositions } from 'src/core/vacant-position-posting/sub-modules/vpp-positions/data/entities/vpp-positions.entity';
import { PrfPositionsView } from 'src/core/prf-details/prf-positions/views/prf-positions-view/data/prf-positions.view';
import { VacantPositionPostingView } from 'src/core/vacant-position-posting/data/views/vacant-position-posting-view/data/vacant-position-posting.view';
import { VppPsb } from 'src/core/vacant-position-posting/sub-modules/vpp-psb/data/entities/vpp-psb.entity';
import { PostingApplicantsDetailedView } from 'src/core/vacant-position-posting/sub-modules/applicants/data/views/posting-applicants-detailed-view/data/posting-applicants-detailed.view';
import { VppPsbApplicants } from 'src/core/vacant-position-posting/sub-modules/vpp-psb-applicants/data/entities/vpp-psb-applicants.entity';
import { SettingsEntities } from 'src/core/settings/data/settings.entities';
import { VacantPositionPostingPublicationView } from 'src/core/vacant-position-posting/data/views/vacant-position-posting-view/data/vacant-position-posting-publication.view';
import { OfficerInChargeView } from 'src/core/officer-in-charge/data/officer-in-charge-view/officer-incharge.view';
import { OrgStructView } from 'src/core/organization/data/views/organization.view';
import { EmployeeTags } from 'src/core/employee-tags/data/employee-tags.entity';
import { PositionDutiesResponsibilities } from 'src/core/position-duties-responsibilities/data/entities/position-duties-responsibilities.entity';
import { EmployeeTemporaryAssignment } from 'src/core/employee-temporary-assignment/data';
import { Employee201 } from 'src/core/employees/201/entities/employee201.entity';
import { AllEmployeesView } from 'src/core/employees/data/views/all-employees.view';
import { NosiNosa } from 'src/core/salary-grade/components/nosi-nosa/data/entities/nosi-nosa.entity';

export const typeormEntities = [
  ...PrfEntities,
  ...PdsEntities,
  ...SettingsEntities,
  VppPsbApplicants,
  VacantPositionPostingView,
  VacantPositionPostingPublicationView,
  PrfPositionsView,
  DutiesResponsibilities,
  VppPositions,
  PrfTrail,
  CompetencyModelOccupation,
  VppInterviewRating,
  ExternalApplicants,
  VacantPositionPosting,
  VppSchedule,
  VppPsb,
  PostingApplicants,
  PostingApplicantsDetailedView,
  Committees,
  CommitteeMembers,
  Users,
  SuperUser,
  Employees,
  PlantillaPositions,
  SalaryGrade,
  QualificationStandards,
  Office,
  Departments,
  Divisions,
  OfficePositions,
  DepartmentPositions,
  DivisionPositions,
  CompetencyModel,
  Domain,
  Occupation,
  OccupationalGroup,
  OccupationalGroupDutiesResponsibilities,
  OccupationsDutiesResponsibilities,
  PlantillaPositions,
  PlantillaView,
  CompetencyModelView,
  PlantillaDropDownView,
  PositionCompetencyProficiencyLevel,
  Proficiency,
  QualificationStandards,
  SalaryGrade,
  ApplicantEndorsement,
  HiringProcessResultsView,
  PositionDescriptionFormBasic,
  PositionDescriptionFormExternalContacts,
  PositionDescriptionFormInternalContacts,
  PositionDescriptionFormWorkingCondition,
  OfficerInCharge,
  OfficerInChargeView,
  WorkExperienceSheetAccomplishments,
  WorkExperienceSheetBasic,
  WorkExperienceSheetDuties,
  Modules,
  UserRoles,
  UserLogs,
  OrgStructView,
  EmployeeTags,
  PositionDutiesResponsibilities,
  EmployeeTemporaryAssignment,
  Employee201,
  AllEmployeesView,
  NosiNosa,
];
