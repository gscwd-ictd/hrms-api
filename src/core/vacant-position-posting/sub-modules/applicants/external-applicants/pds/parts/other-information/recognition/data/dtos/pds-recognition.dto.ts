export class PDSRecognitionDTO {
  _id?: string;
  recognition: string;
  externalApplicantId: string;
}

export type PDSRecognitionUpdateDTO = {
  update: PDSRecognitionDTO[];
  deleted: PDSRecognitionDTO[];
};
