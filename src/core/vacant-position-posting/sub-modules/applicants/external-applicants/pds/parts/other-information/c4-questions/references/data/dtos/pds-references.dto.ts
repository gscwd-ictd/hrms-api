export class PDSReferencesDTO {
  _id?: string;
  name: string;
  address: string;
  telephoneNumber: string;
  externalApplicantId: string;
}

export type PDSReferencesUpdateDTO = {
  deleted: PDSReferencesDTO[];
  update: PDSReferencesDTO[];
};
