import { WorkExperienceSheetAccomplishmentsDTO } from '../contents/accomplishments/data/accomplishments.dto';
import { WorkExperienceSheetBasicDTO } from '../contents/basic/data/basic.dto';
import { WorkExperienceSheetDutiesDTO } from '../contents/duties/data/duties.dto';

export class WorkExperienceSheetDTO2 {
  basic: WorkExperienceSheetBasicDTO;
  duties: WorkExperienceSheetDutiesDTO[];
  accomplishments: WorkExperienceSheetAccomplishmentsDTO[];
}

export class WorkExperienceSheetDTO {
  _id: string;
  vppId: string;
  companyName: string;
  monthlySalary: number | null;
  appointmentStatus: string;
  isGovernmentService: boolean;
  salaryGrade: string | null;
  from: string;
  to: string | null;
  isSelected?: boolean;
  isPresentWork?: boolean;
  immediateSupervisor: string;
  nameOfOffice: string;
  accomplishments: WorkExperienceSheetAccomplishmentsDTO[];
  duties: WorkExperienceSheetDutiesDTO[];
}

export class WorkExperienceSheetAddDTO {
  vppId: string;
  withRelevantExperience: boolean;
  workExperiencesSheet: WorkExperienceSheetDTO[];
}
