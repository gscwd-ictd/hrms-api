import { ExternalApplicants } from '../../../../../data/entities/external-applicants.entity';

export class PDSEducationDTO {
  _id?: string;
  schoolName: string;
  degree: string;
  from: number;
  to: number;
  units: string;
  yearGraduated: number;
  awards: string;
  externalApplicantId: ExternalApplicants;
}

export class PDSSchoolsAttended {
  schools: PDSEducationDTO[];
}

export class PDSEducationElementaryDTO {
  _id?: string;
  schoolName: string;
  from: number;
  to: number;
  units: string;
  yearGraduated: number;
  awards: string;
  degree?: string;
  externalApplicantId: ExternalApplicants;
}

export type PDSEducationUpdateDTO = {
  update: PDSEducationDTO[];
  deleted: PDSEducationDTO[];
};
