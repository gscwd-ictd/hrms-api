import { PositionDescriptionFormService } from './position-description-form.service';
import { Controller, Post, Param, Get, Body, Put } from '@nestjs/common';
import { PositionDescriptionFormDTO, UpdatePositionDescriptionFormDto } from './data/position-description-form.dto';

@Controller('position-description-form')
export class PositionDescriptionFormController {
  constructor(private readonly positionDescriptionFormService: PositionDescriptionFormService) {}

  @Post()
  async savePositionDescriptionForm(@Body() positionDescriptionFormDTO: PositionDescriptionFormDTO) {
    return await this.positionDescriptionFormService.savePositionDescriptionForm(positionDescriptionFormDTO);
  }

  @Put()
  async updatePositionDescriptionFrom(@Body() data: UpdatePositionDescriptionFormDto) {
    return await this.positionDescriptionFormService.updatePositionDescriptionForm(data);
  }

  @Get('/status/:posting_applicant_id')
  async hasDbmCsc(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.positionDescriptionFormService.hasDbmCsc(postingApplicantId);
  }

  @Get(':posting_applicant_id')
  async getPositionDescriptionFormByPostingApplicantId(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.positionDescriptionFormService.getPositionDescriptionFormByPostingApplicantId(postingApplicantId);
  }

  @Get('csc-form-33-b/certified/list')
  async listCertifiedBy() {
    return await this.positionDescriptionFormService.listCertifiedBy();
  }
}
