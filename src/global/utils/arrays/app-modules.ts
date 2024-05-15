import { UserLogsModule } from './../../user-logs/user-logs.module';
import { ModulesModule } from './../../../core/user-roles/hrms-modules/modules.module';
import { WorkExperienceSheetModule } from './../../../core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/parts/work-experience-sheet/work-experience-sheet.module';
import { OfficerInChargeModule } from './../../../core/officer-in-charge/officer-in-charge.module';
import { ExternalApplicantsModule } from './../../../core/vacant-position-posting/sub-modules/applicants/external-applicants/external-applicants.module';
import { PositionDescriptionFormModule } from './../../../core/vacant-position-posting/sub-modules/position-description-form/position-description-form.module';
import { AuthModule } from 'src/global/auth/auth.module';
import { UsersModule } from 'src/core/users/users.module';
import { CommitteeMembersModule } from 'src/core/committee-members/committee-members.module';
import { CommitteesModule } from 'src/core/committees/committees.module';
import { CompetencyModelOccupationModule } from 'src/core/competency-model-occupation/competency-model-occupation.module';
import { CompetencyModelModule } from 'src/core/competency-model/competency-model.module';
import { DomainModule } from 'src/core/domain/domain.module';
import { EmployeesModule } from 'src/core/employees/employees.module';
import { OccupationModule } from 'src/core/occupation/occupation.module';
import { OccupationalGroupDutiesResponsibilitiesModule } from 'src/core/occupational-group-duties-responsibilities/occupational-group-duties-responsibilities.module';
import { OccupationalGroupModule } from 'src/core/occupational-group/occupational-group.module';
import { OccupationsDutiesResponsibilitiesModule } from 'src/core/occupations-duties-responsibilities/occupations-duties-responsibilities.module';
import { DepartmentsModule } from 'src/core/organization/department/department.module';
import { DivisionsModule } from 'src/core/organization/division/division.module';
import { OfficeModule } from 'src/core/organization/office/office.module';
import { OrganizationModule } from 'src/core/organization/organization.module';
import { DepartmentPositionsModule } from 'src/core/organizational-positions/department-positions/department-positions.module';
import { DivisionPositionsModule } from 'src/core/organizational-positions/division-positions/division-positions.module';
import { OfficePositionsModule } from 'src/core/organizational-positions/office-positions/office-positions.module';
import { OrganizationalPositionsModule } from 'src/core/organizational-positions/organizational-positions.module';
import { PlantillaPositionsModule } from 'src/core/plantilla-positions/plantilla-positions.module';
import { PositionCompetencyProficiencyLevelModule } from 'src/core/position-competency-proficiency-level/position-competency-proficiency-level.module';
import { ProficiencyModule } from 'src/core/proficiency/proficiency.module';
import { QualificationStandardsModule } from 'src/core/qualification-standards/qualification-standards.module';
import { SalaryGradeModule } from 'src/core/salary-grade/salary-grade.module';
import { VacantPositionPostingModule } from 'src/core/vacant-position-posting/vacant-position-posting.module';
import { VppInterviewRatingModule } from 'src/core/vacant-position-posting/sub-modules/vpp-interview-rating/vpp-interview-rating.module';
import { MicroserviceModule } from '../config-classes/modules/microservice.module';
import { PlantillaViewModule } from 'src/core/plantilla-positions/views/plantilla-view/plantilla-view.module';
import { PrfDetailsModule } from 'src/core/prf-details/prf-details.module';
import { PDSModule } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/pds.module';
import { DutiesResponsibilitiesModule } from 'src/core/duties-responsibilities/duties-responsibilities.module';
import { PrfPositionsViewModule } from 'src/core/prf-details/prf-positions/views/prf-positions-view/prf-positions-view.module';
import { VacantPositionPostingViewModule } from 'src/core/vacant-position-posting/data/views/vacant-position-posting-view/vacant-position-posting-view.module';
import { UserRolesModule } from 'src/core/user-roles/user-roles.module';
import { HolidaysModule } from 'src/core/holidays/holidays.module';
import { EmployeeTagsModule } from 'src/core/employee-tags/employee-tags.module';
import { StatsModule } from 'src/core/stats/stats.module';
import { PositionDutiesResponsibilitiesModule } from 'src/core/position-duties-responsibilities/data/core/position-duties-responsibilities.module';
import { EmployeeTemporaryAssignmentModule } from 'src/core/employee-temporary-assignment/core';

export const modules = [
  AuthModule,
  UsersModule,
  PrfPositionsViewModule,
  VacantPositionPostingViewModule,
  DutiesResponsibilitiesModule,
  PrfDetailsModule,
  PDSModule,
  CompetencyModelOccupationModule,
  VppInterviewRatingModule,
  VacantPositionPostingModule,
  CommitteesModule,
  CommitteeMembersModule,
  EmployeesModule,
  OrganizationModule,
  MicroserviceModule,
  CompetencyModelModule,
  DomainModule,
  OccupationModule,
  OccupationalGroupModule,
  OccupationalGroupDutiesResponsibilitiesModule,
  OccupationsDutiesResponsibilitiesModule,
  DepartmentsModule,
  DivisionsModule,
  OfficeModule,
  DepartmentPositionsModule,
  DivisionPositionsModule,
  OfficePositionsModule,
  PlantillaViewModule,
  PlantillaPositionsModule,
  PositionCompetencyProficiencyLevelModule,
  ProficiencyModule,
  QualificationStandardsModule,
  SalaryGradeModule,
  OrganizationalPositionsModule,
  PositionDescriptionFormModule,
  ExternalApplicantsModule,
  OfficerInChargeModule,
  WorkExperienceSheetModule,
  UserRolesModule,
  UserLogsModule,
  EmployeeTagsModule,
  StatsModule,
  HolidaysModule,
  ModulesModule,
  StatsModule,

  PositionDutiesResponsibilitiesModule,
  EmployeeTemporaryAssignmentModule,
];
