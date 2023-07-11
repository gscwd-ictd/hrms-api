import { Controller, Get, Param } from '@nestjs/common';
import { PostingApplicantsDetailedViewService } from './posting-applicants-detailed-view.service';

@Controller('vacant-position-postings/applicants/')
export class PostingApplicantsDetailedViewController {
  constructor(private postingApplicantsViewService: PostingApplicantsDetailedViewService) {}

  @Get(':vpp_id/:psb_id')
  async getApplicants(@Param('vpp_id') vppId: string, @Param('psb_id') psbEmployeeId: string) {
    return await this.postingApplicantsViewService.getApplicantsPerPosting(vppId, psbEmployeeId);
  }

  @Get(':vpp_id/:psb_id/:posting_applicant_id')
  async getSingleApplicant(@Param('vpp_id') vppId: string, @Param('psb_id') psbEmployeeId: string, @Param('posting_applicant_id') postingApplicantId: string) {
    return await this.postingApplicantsViewService.getApplicantPerPosting(vppId, psbEmployeeId, postingApplicantId);
  }

  @Get(':vpp_id/')
  async getQualifiedApplicantsByVppId(@Param('vpp_id') vppId: string) {
    return await this.postingApplicantsViewService.getQualifiedApplicantsByVppId(vppId);
  }

  @Get('/confirmed/external/onboarding/all')
  async getConfirmedExternalApplicants() {
    return await this.postingApplicantsViewService.getConfirmedExternalApplicants();
  }
}
