import { Controller } from '@nestjs/common';
import { WorkExperienceSheetAccomplishmentsService } from './accomplishments.service';

@Controller('work-experience-sheet/accomplishments')
export class WorkExperienceSheetAccomplishmentsController {
  constructor(private readonly workExperienceSheetAccomplishmentsService: WorkExperienceSheetAccomplishmentsService) {}
}
