import { Body, Controller, Get, Param, Post, UseGuards, Put } from '@nestjs/common';
import { PdsDTO, PdsDTOUpdate } from './data/dtos/pds.dto';
import { PDSService } from './pds.service';

@Controller('pds')
export class PDSController {
  constructor(private pdsService: PDSService) { }

  @Post(':applicant_id')
  async savePDS(@Param('applicant_id') externalApplicantId: string, @Body() pdsDTO: PdsDTO) {
    return await this.pdsService.savePDS(externalApplicantId, pdsDTO);
  }

  @Get(':applicant_id')
  async getPDS(@Param('applicant_id') externalApplicantId: string) {
    return await this.pdsService.getPDSEmp(externalApplicantId);
  }

  @Get(':applicant_id/v2')
  async getPDSEmp(@Param('applicant_id') externalApplicantId: string) {
    return await this.pdsService.getPDSEmp(externalApplicantId);
  }

  @Get('/psb/:applicant_id')
  async getApplicantPdsWithWorkExperience(@Param('applicant_id') applicantId: string) {
    return await this.pdsService.getApplicantPdsWithWorkExperience(applicantId);
  }

  @Put(':applicant_id')
  async updatePDS(@Param('applicant_id') externalApplicantId: string, @Body() pdsDTO: PdsDTOUpdate) {
    return await this.pdsService.updatePDS(externalApplicantId, pdsDTO);
  }
}
