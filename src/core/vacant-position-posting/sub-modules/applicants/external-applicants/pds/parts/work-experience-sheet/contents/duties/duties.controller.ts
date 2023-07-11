import { Controller } from '@nestjs/common';
import { WorkExperienceSheetDutiesService } from './duties.service';

@Controller()
export class WorkExperienceSheetDutiesController {
  constructor(private readonly workExperienceSheetDutiesService: WorkExperienceSheetDutiesService) {}
}
