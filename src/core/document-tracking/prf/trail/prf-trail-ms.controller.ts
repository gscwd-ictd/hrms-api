import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrfTrailService } from './prf-trail.service';

@Controller()
export class PrfTrailMsController {
  constructor(private readonly prfTrailService: PrfTrailService) {}

  @MessagePattern('get_prf_approvals_count')
  async getPrfForApprovalCount(@Payload() employeeId: string) {
    return (await this.prfTrailService.getPrfsForApproval(employeeId)).length;
  }
}
