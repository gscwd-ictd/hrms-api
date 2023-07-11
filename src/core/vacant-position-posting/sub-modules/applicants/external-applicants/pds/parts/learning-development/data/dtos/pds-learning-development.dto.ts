export class PDSLearningDevelopmentDTO {
  _id?: string;
  title: string;
  conductedBy: string;
  type: string;
  from: Date;
  to: Date;
  numberOfHours: number;
  externalApplicantId: string;
}

export type PDSLearningDevelopmentUpdateDTO = {
  update: PDSLearningDevelopmentDTO[];
  deleted: PDSLearningDevelopmentDTO[];
};
