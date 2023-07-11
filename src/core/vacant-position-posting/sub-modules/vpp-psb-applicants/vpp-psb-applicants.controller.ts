import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { VppPsbApplicantsDTO } from './data/dtos/vpp-psb-applicants.dto';
import { VppPsbApplicantsService } from './vpp-psb-applicants.service';

@Controller('vacant-position-postings/psb-applicants/')
export class VppPsbApplicantsController {
  constructor(private vppPsbApplicantsService: VppPsbApplicantsService) {}

  @Patch(':vpp_id/:employee_id')
  async setInterviewed(@Param('vpp_id') vppId: string, @Param('employee_id') employeeId: string, @Body() vppPsbApplicantsDTO: VppPsbApplicantsDTO) {
    return await this.vppPsbApplicantsService.setInterviewed(vppId, employeeId, vppPsbApplicantsDTO);
  }

  @Patch('exam/:vpp_id')
  async setExamScore(@Param('vpp_id') vppId: string, @Body() vppPsbApplicantsDTO: VppPsbApplicantsDTO) {
    return await this.vppPsbApplicantsService.setExamScore(vppId, vppPsbApplicantsDTO);
  }

  @Get('remarks/:posting_applicant_id')
  async getPsbRemarks(@Param('posting_applicant_id') postingApplicantId: string) {
    return await this.vppPsbApplicantsService.getPsbRemarks(postingApplicantId);
  }
}
