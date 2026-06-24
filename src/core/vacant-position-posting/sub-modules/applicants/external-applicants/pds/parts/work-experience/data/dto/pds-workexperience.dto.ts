import { PDSWorkExperience } from './../entities/pds-workexperience.entity';
import { ExternalApplicants } from './../../../../../data/entities/external-applicants.entity';
import { AppointmentStatus } from '../../../../utils/enums/pds.enum';

export class PDSWorkExperienceDTO {
  _id: string;
  positionTitle: string;
  companyName: string;
  monthlySalary?: number;
  appointmentStatus: AppointmentStatus;
  isGovernmentService: boolean;
  salaryGrade: string;
  from: Date;
  to: Date;
  externalApplicantId: ExternalApplicants;
}

export type PDSWorkExperienceUpdateDTO = {
  update: PDSWorkExperienceDTO[];
  deleted: PDSWorkExperienceDTO[];
};
