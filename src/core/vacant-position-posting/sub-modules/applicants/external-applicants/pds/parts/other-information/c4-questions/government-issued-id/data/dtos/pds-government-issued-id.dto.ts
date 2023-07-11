import { ExternalApplicants } from './../../../../../../../data/entities/external-applicants.entity';
export class PDSGovernmentIssuedIdDTO {
  _id?: string;
  issuedId: string;
  idNumber: string;
  issueDate: Date;
  issuePlace: string;
  externalApplicantId: ExternalApplicants;
}
