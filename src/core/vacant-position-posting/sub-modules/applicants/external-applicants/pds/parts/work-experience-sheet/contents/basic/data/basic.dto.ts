import { PDSWorkExperience } from '../../../../work-experience/data/entities/pds-workexperience.entity';

export class WorkExperienceSheetBasicDTO {
  _id?: string;
  workExperienceId: PDSWorkExperience;
  postingApplicantId: string;
  nameOfOffice: string;
  immediateSupervisor: string;
}
