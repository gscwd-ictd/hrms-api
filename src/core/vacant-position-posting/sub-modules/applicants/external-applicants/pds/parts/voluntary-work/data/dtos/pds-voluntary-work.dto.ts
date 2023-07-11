export class PDSVoluntaryWorkDTO {
  _id?: string;
  organizationName: string;
  position: string;
  from: Date;
  to: Date;
  numberOfHours: number;
  externalApplicantId: string;
}

export type PDSVoluntaryWorkUpdateDTO = {
  update: PDSVoluntaryWorkDTO[];
  deleted: PDSVoluntaryWorkDTO[];
};
