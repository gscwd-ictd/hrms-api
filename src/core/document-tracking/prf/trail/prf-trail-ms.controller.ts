import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PrfTrailService } from './prf-trail.service';
import { MsExceptionFilter } from 'src/global/utils/filters/rpc-exception.filter';

@Controller()
export class PrfTrailMsController {
  constructor(private readonly prfTrailService: PrfTrailService) { }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_prf_approvals_count')
  async getPrfForApprovalCount(@Payload() employeeId: string) {
    try {
      return (await this.prfTrailService.getPrfsForApproval(employeeId)).length;
    }
    catch (error) {
      throw new RpcException(error.message);
    }

  }
}
