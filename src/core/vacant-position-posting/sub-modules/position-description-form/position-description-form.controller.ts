import { PositionDescriptionFormService } from './position-description-form.service';
import { Controller, Post, Param, Get, Body } from '@nestjs/common';
import { PositionDescriptionFormDTO } from './data/position-description-form.dto';

@Controller('position-description-form')
export class PositionDescriptionFormController {
  constructor(private readonly positionDescriptionFormService: PositionDescriptionFormService) {}

  @Post(':posting_applicant_id')
  async savePositionDescriptionForm(@Param('posting_applicant_id') postingApplicantId: string, @Body() positionDescriptionFormDTO: PositionDescriptionFormDTO) {
    return await this.positionDescriptionFormService.savePositionDescriptionForm(postingApplicantId, positionDescriptionFormDTO);
  }

  @Get('/status/:posting_applicant_id')
  async hasDbmCsc(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.positionDescriptionFormService.hasDbmCsc(postingApplicantId);
  }

  @Get(':posting_applicant_id')
  async getPositionDescriptionFormByPostingApplicantId(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.positionDescriptionFormService.getPositionDescriptionFormByPostingApplicantId(postingApplicantId);
  }
}
