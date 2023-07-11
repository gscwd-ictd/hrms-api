export class PDSSkillsDTO {
  _id?: string;
  skill: string;
  externalApplicantId: string;
}

export type PDSSkillsUpdateDTO = {
  update: PDSSkillsDTO[];
  deleted: PDSSkillsDTO[];
};
