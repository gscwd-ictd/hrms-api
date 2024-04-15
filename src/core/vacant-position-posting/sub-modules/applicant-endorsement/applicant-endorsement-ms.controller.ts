import { Controller } from '@nestjs/common';
import { ApplicantEndorsementService } from './applicant-endorsement.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostingStatus } from '../../utils/enums/posting-status.enum';
import { ApplicantEndorsementStatus } from './utils/types/applicant-endorsement.enum';

@Controller()
export class ApplicantEndorsementMsController {
  constructor(private readonly applicantEndorsementService: ApplicantEndorsementService) {}

  @MessagePattern('get_pending_applicant_endorsements_count')
  async getPendingApplicantEndorsementsCount(@Payload() employeeId: string) {
    return (
      await this.applicantEndorsementService.getAllPublicationsUnderRequestingEntityByEndorsementStatus(
        employeeId,
        ApplicantEndorsementStatus.ENDORSED,
        PostingStatus.REQUESTING_ENTITY_SELECTION,
      )
    ).length;
  }

  @MessagePattern('get_appointing_authority_selection_count')
  async getAppointingAuthoritySelectionCount() {
    return await this.applicantEndorsementService.getAppointingAuthoritySelectionCount();
  }
}
