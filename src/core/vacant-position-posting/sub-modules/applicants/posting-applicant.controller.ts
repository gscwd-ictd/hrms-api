import { InternalApplicantGuard } from './guards/internal-applicant.guard';
import { ExternalApplicantsDTO } from './external-applicants/data/dtos/external-applicants.dto';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { VacantPositionPostingService } from '../../vacant-position-posting.service';
import { AddEmployeePostingApplicantDTO, ApplicantStatusDTO, PostingApplicantsExamDTO } from './data/dtos/posting-applicants.dto';
import { ApplicantsService } from './posting-applicants.service';
import { ApplicantStatusType } from './utils/types/applicant-status.type';

@Controller('applicant')
export class ApplicantController {
  constructor(private vacantPositionPostingService: VacantPositionPostingService, private readonly postingApplicantsService: ApplicantsService) {}

  @Get('/:posting_id/:applicant_id')
  async getApplicantDetailPerPosting(@Param('posting_id') postingId: string, @Param('applicant_id') applicantId: string) {
    return await this.vacantPositionPostingService.applicantDetailsPerPosting(postingId, applicantId);
  }

  @Get(':vpp_id/internal/:employee_id')
  async getInternalApplicantDetails(@Param('vpp_id') vppId: string, @Param('employee_id') employeeId: string) {
    return await this.postingApplicantsService.getInternalApplicantDetails(vppId, employeeId);
  }

  @Get(':vpp_id/external/:external_applicant_id')
  async getApplicationDetails(@Param('vpp_id') vacantPositionPostingId: string, @Param('external_applicant_id') externalApplicantId: string) {
    return await this.postingApplicantsService.entityRepository.findOne({ where: { vacantPositionPostingId, externalApplicantId } });
  }

  @Post(':vpp_id/external/:external_applicant_id')
  async addExternalApplicant(@Param('vpp_id') vppId: string, @Param('external_applicant_id') externalApplicantId: string) {
    return await this.postingApplicantsService.addExternalApplicant(vppId, externalApplicantId);
  }

  @UseGuards(InternalApplicantGuard)
  @Post(':vpp_id/internal/:employee_id')
  async addInternalApplicant(@Param('vpp_id') vppId: string, @Param('employee_id') employeeId: string, @Body() addEmployeePostingApplicantDTO: AddEmployeePostingApplicantDTO) {
    return await this.postingApplicantsService.addInternalApplicant(vppId, employeeId, addEmployeePostingApplicantDTO);
  }

  @Patch('/scores/')
  async setExamScore(@Body() applicantsExamScores: PostingApplicantsExamDTO) {
    return await this.postingApplicantsService.setExamScore(applicantsExamScores);
  }

  @Patch(':posting_applicant_id/status')
  async updateApplicantStatus2(@Param('posting_applicant_id') postingApplicantId: string, @Body() applicantStatusDTO: ApplicantStatusDTO) {
    return await this.postingApplicantsService.updateApplicantStatus2(postingApplicantId, applicantStatusDTO);
  }

  @Patch('/:posting_id/:applicant_id')
  async updateApplicantStatus(@Param('posting_id') vacantPositionPostingId: string, @Param('applicant_id') applicantId: string, @Body() applicantStatus: ApplicantStatusType) {
    return await this.postingApplicantsService.updateApplicantStatus({ vacantPositionPostingId, applicantId, ...applicantStatus });
  }

  @UseGuards(InternalApplicantGuard)
  @Post('testing-route')
  async testRoute(@Body() addWorkExperienceSheetDTO: AddEmployeePostingApplicantDTO) {
    return addWorkExperienceSheetDTO;
  }
}
