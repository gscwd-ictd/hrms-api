import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { VppInterviewRatingUpdateDTO } from './data/dtos/vpp-interview-rating.dto';
import { VppInterviewRatingService } from './vpp-interview-rating.service';

@Controller('vacant-position-postings/interview-rating/')
export class VppInterviewRatingController {
  constructor(private vppInterviewRatingService: VppInterviewRatingService) {}

  @Get(':vpp_id')
  async rankingOfApplicants(@Param('vpp_id') vppId: string) {
    return await this.vppInterviewRatingService.rankingOfApplicants(vppId);
  }

  @Get('reports/hrd005-2/')
  async getFormHrd005_2(@Query('effectivity_date') effectivityDate: Date) {
    return await this.vppInterviewRatingService.getFormHrd005_2ByEffectivityDate(effectivityDate);
  }

  @Get('reports/csc-form-2/:year_month')
  async getCscForm2(@Param('year_month') yearMonth: string) {
    return await this.vppInterviewRatingService.getCscForm2(yearMonth);
  }

  @Get('reports/csc-form-4/:posting_applicant_id')
  async getCscForm4(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.vppInterviewRatingService.getCscForm4(postingApplicantId);
  }

  @Get('reports/csc-form-33-b/:posting_applicant_id')
  async getCscForm33B(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.vppInterviewRatingService.getCscForm33B(postingApplicantId);
  }

  @Get('reports/hrd002-3/:vppId')
  async getFormHrd002_3PerPsb(@Param('vppId') vppId: string) {
    return await this.vppInterviewRatingService.getFormHrd002_3PerPsb(vppId);
  }

  @Get(':vppId/:employeeId')
  async getRatingOfApplicantsPerPosting(@Param('vppId') vppId: string, @Param('employeeId') employeeId: string) {
    return await this.vppInterviewRatingService.getRatingOfApplicantsPerPosting(vppId, employeeId);
  }

  @Patch(':employee_id/:posting_applicants_id')
  async updateInterviewRating(
    @Param('employee_id') employeeId: string,
    @Param('posting_applicants_id') postingApplicantsId: string,
    @Body() vppInterviewRatingUpdateDTO: VppInterviewRatingUpdateDTO,
  ) {
    return await this.vppInterviewRatingService.updateVppInterviewRating(employeeId, postingApplicantsId, vppInterviewRatingUpdateDTO);
  }
}
