import { PostingApplicantRelevantExperienceUpdateDTO } from './../data/dtos/posting-applicants.dto';
import { PDSService } from './pds/pds.service';
import { ExternalApplicantLoginGuard } from './guards/external-applicants.guard';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ExternalApplicantsService } from './external-applicants.service';
import { ExternalApplicantsLogin } from './decorators/external-applicants.decorator';
import { ExternalApplicantsPDSGuard } from './guards/external-applicants-pds.guard';
import { ExternalApplicantsDTO, JobPortalDTO } from './data/dtos/external-applicants.dto';

@Controller('external-applicants')
export class ExternalApplicantsController {
  constructor(private readonly externalApplicantsService: ExternalApplicantsService, private readonly pdsService: PDSService) {}

  @UseGuards(ExternalApplicantLoginGuard)
  @Post('/login')
  async setApplicantCookie(@ExternalApplicantsLogin() details: { externalApplicantId: string; vppId: string }) {
    if (details) return { login: 'success', details };
    return { login: 'failed' };
  }

  @Post('/new/:vpp_id')
  async addExternalApplicant(@Param('vpp_id') vppId: string, @Body() jobPortalDTO: JobPortalDTO) {
    console.log(vppId);
    console.log(jobPortalDTO);
    return await this.externalApplicantsService.addExternalApplicant(vppId, jobPortalDTO);
  }

  @Post(':vpp_id')
  async getApplicantInformationByEmail(@Param('vpp_id') vppId: string, @Body() email: { email: string }) {
    return await this.externalApplicantsService.getApplicantInformationByEmail(email, vppId);
  }

  @UseGuards(ExternalApplicantsPDSGuard)
  @Get('/pds')
  async getApplicantPDS(@ExternalApplicantsLogin() externalApplicantsLogin: { externalApplicantId: string; vppId: string }) {
    const pdsDetails = await this.pdsService.getPDSEmp(externalApplicantsLogin.externalApplicantId);
    return { pdsDetails, vppId: externalApplicantsLogin.vppId, externalApplicantId: externalApplicantsLogin.externalApplicantId };
  }

  @UseGuards(ExternalApplicantsPDSGuard)
  @Get('/existing-pds/')
  async checkExistingApplicantPDS(@ExternalApplicantsLogin() externalApplicantsLogin: { externalApplicantId: string; vppId: string }) {
    return await this.pdsService.checkExistingApplicantPDS(externalApplicantsLogin.externalApplicantId);
  }

  @UseGuards(ExternalApplicantsPDSGuard)
  @Get('/relevant-work-experience-check/')
  async checkRelevantWorkExperience(@ExternalApplicantsLogin() externalApplicantsLogin: { externalApplicantId: string; vppId: string }) {
    return await this.externalApplicantsService.checkRelevantWorkExperience(externalApplicantsLogin);
  }

  @UseGuards(ExternalApplicantsPDSGuard)
  @Patch('/relevant-work-experience')
  async updateRelevantWorkExperience(
    @ExternalApplicantsLogin() externalApplicantsLogin: { externalApplicantId: string; vppId: string },
    @Body() postingApplicantRelevantExperienceUpdateDTO: PostingApplicantRelevantExperienceUpdateDTO,
  ) {
    return await this.externalApplicantsService.updateRelevantWorkExperience(externalApplicantsLogin, postingApplicantRelevantExperienceUpdateDTO);
  }

  @UseGuards(ExternalApplicantsPDSGuard)
  @Get('/name/')
  async getExternalApplicantName(@ExternalApplicantsLogin() externalAppplicantsLogin: { externalApplicantId: string; vppId: string }) {
    return await this.externalApplicantsService.getExternalApplicantName(externalAppplicantsLogin.externalApplicantId);
  }
}
