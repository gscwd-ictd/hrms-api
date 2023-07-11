import { ExternalApplicants } from './../../../../../../data/entities/external-applicants.entity';
export class PDSFamilySpouseDTO {
  firstName: string;
  middleName: string;
  lastName: string;
  nameExtension: string;
  occupation: string;
  employer: string;
  businessAddress: string;
  telephoneNumber: string;
  externalApplicantId: ExternalApplicants;
}
