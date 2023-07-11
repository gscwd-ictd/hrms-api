import { Controller, Get, Param } from '@nestjs/common';
import { VacantPositionPostingService } from '../../vacant-position-posting.service';

@Controller('applicants')
export class ApplicantsController {
  constructor(private vacantPositionPostingService: VacantPositionPostingService) {}
  @Get(':posting_id')
  async getApplicants(@Param('posting_id') postingId: string) {
    return await this.vacantPositionPostingService.applicantDetails(postingId);
  }
}
