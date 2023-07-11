import { WorkExperienceSheetBasic } from '../../basic/data/basic.entity';

export class WorkExperienceSheetDutiesDTO {
  _id?: string;
  workExperienceSheetBasicId: WorkExperienceSheetBasic;
  duty: string;
}
