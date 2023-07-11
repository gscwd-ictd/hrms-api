import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';

export class PDSFamilyChildrenDTO {
  _id?: string;
  childName: string;
  birthDate: Date;
  externalApplicantId: ExternalApplicants;
}

export type PDSFamilyChildrenUpdateDTO = {
  update: PDSFamilyChildrenDTO[];
  deleted: PDSFamilyChildrenDTO[];
};
