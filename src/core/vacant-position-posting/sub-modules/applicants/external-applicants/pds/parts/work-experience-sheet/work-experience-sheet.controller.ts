import { WorkExperienceSheetService } from './work-experience-sheet.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkExperienceSheetAddDTO, WorkExperienceSheetDTO } from './data/work-experience-sheet.dto';

@Controller('pds/work-experience-sheet')
export class WorkExperienceSheetController {
  constructor(private readonly workExperienceSheetService: WorkExperienceSheetService) {}
  @Post(':posting_applicant_id')
  async addWorkExperienceSheet(@Param('posting_applicant_id') postingApplicantId: string, @Body() workExperienceSheetDTO: WorkExperienceSheetAddDTO) {
    return await this.workExperienceSheetService.addWorkExperienceSheet(postingApplicantId, workExperienceSheetDTO);
  }

  @Get(':posting_applicant_id')
  async getWorkExperienceSheet(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.workExperienceSheetService.getWorkExperienceSheet(postingApplicantId);
  }
}
