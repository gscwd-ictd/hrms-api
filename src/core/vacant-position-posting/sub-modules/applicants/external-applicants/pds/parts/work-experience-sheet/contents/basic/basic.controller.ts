import { WorkExperienceSheetBasicService } from './basic.service';
import { Controller } from '@nestjs/common';

@Controller('pds/work-experience-sheet/basic')
export class WorkExperienceSheetBasicController {
  constructor(private readonly workExperienceSheetBasicService: WorkExperienceSheetBasicService) {}
}
