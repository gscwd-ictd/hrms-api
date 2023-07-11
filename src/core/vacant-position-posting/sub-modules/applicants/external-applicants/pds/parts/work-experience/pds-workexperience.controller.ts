import { PDSWorkExperienceService } from './pds-workexperience.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('pds/work-experience/')
export class PDSWorkExperienceController {
  constructor(private readonly pdsWorkExperienceService: PDSWorkExperienceService) {}

  @Get(':external_applicant_id')
  async getWorkExperiences(@Param('external_applicant_id') externalApplicantId: string) {
    return await this.pdsWorkExperienceService.getWorkExperiences(externalApplicantId);
  }
}
