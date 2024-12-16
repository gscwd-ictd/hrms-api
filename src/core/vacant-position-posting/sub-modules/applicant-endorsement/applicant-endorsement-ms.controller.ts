import { Controller, UseFilters } from '@nestjs/common';
import { ApplicantEndorsementService } from './applicant-endorsement.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PostingStatus } from '../../utils/enums/posting-status.enum';
import { ApplicantEndorsementStatus } from './utils/types/applicant-endorsement.enum';
import { MsExceptionFilter } from 'src/global/utils/filters/rpc-exception.filter';

@Controller()
export class ApplicantEndorsementMsController {
  constructor(private readonly applicantEndorsementService: ApplicantEndorsementService) { }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_pending_applicant_endorsements_count')
  async getPendingApplicantEndorsementsCount(@Payload() employeeId: string) {
    try {
      return (
        await this.applicantEndorsementService.getAllPublicationsUnderRequestingEntityByEndorsementStatus(
          employeeId,
          ApplicantEndorsementStatus.ENDORSED,
          PostingStatus.REQUESTING_ENTITY_SELECTION,
        )
      ).length;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_appointing_authority_selection_count')
  async getAppointingAuthoritySelectionCount() {
    try {
      return await this.applicantEndorsementService.getAppointingAuthoritySelectionCount();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
