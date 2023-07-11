import { WorkExperienceSheetBasic } from '../../basic/data/basic.entity';

export class WorkExperienceSheetAccomplishmentsDTO {
  _id?: string;
  workExperienceSheetBasicId: WorkExperienceSheetBasic;
  accomplishment: string;
}
