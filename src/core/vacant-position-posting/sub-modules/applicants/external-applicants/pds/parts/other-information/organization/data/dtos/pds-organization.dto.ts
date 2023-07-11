export class PDSOrganizationDTO {
  _id?: string;
  organization: string;
  externalApplicantId: string;
}
export type PDSOrganizationUpdateDTO = {
  update: PDSOrganizationDTO[];
  deleted: PDSOrganizationDTO[];
};
