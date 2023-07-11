import { PdsDTO } from './../../pds/data/dtos/pds.dto';
export class ExternalApplicantsDTO {
  firstName: string;
  middleName: string;
  lastName: string;
  nameExtension: string;
  email: string;
}

export class JobPortalDTO {
  personalInfo: ExternalApplicantsDTO;
  pds: PdsDTO;
}
