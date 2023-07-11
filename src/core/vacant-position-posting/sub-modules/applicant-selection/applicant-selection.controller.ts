import { Controller, Get, Post, Put, Delete, Body } from '@nestjs/common';
import { ApplicantSelectionService } from './applicant-selection.service';
import { ApplicantSelectionDTO } from './data/applicant-selection.dto';

@Controller('/applicant-selection/')
export class ApplicantSelectionController {
  constructor(private readonly applicantSelectionService: ApplicantSelectionService) {}

  @Get()
  async getSelectedApplicants() {
    return '';
  }

  @Post()
  async selectApplicants(@Body() applicantSelectionDTO: ApplicantSelectionDTO) {
    return await this.applicantSelectionService.selectApplicants(applicantSelectionDTO);
  }
}
