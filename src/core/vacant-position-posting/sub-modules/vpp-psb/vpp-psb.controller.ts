import { Body, Controller, Param, Patch, Post, Get } from '@nestjs/common';
import { VppPsbDTO, VppRecommendation, VppAcknowledgement, VppPsbSwapDto } from './data/dtos/vpp-psb.dto';
import { VppPsbService } from './vpp-psb.service';

@Controller('vacant-position-postings/')
export class VppPsbController {
  constructor(private readonly vppPsbService: VppPsbService) {}

  @Get('/psb/schedules/:employee_id/unacknowledged')
  async getUnacknowledgedVppSchedules(@Param('employee_id') psbEmployeeId: string) {
    return await this.vppPsbService.getUnacknowledgedVppSchedules(psbEmployeeId);
  }

  @Get('/psb/schedules/acknowledged/:vpp_id')
  async getAcknowledgedPSBMembersPerPosting(@Param('vpp_id') vppId: string) {
    return await this.vppPsbService.getAcknowledgedPSBMembersPerPosting(vppId);
  }

  @Patch('psb/:vpp_id/:employee_id')
  async setIsDone(@Param('vpp_id') vppId: string, @Param('employee_id') employeeId: string, @Body() recommendation: VppRecommendation) {
    return await this.vppPsbService.setIsDone(vppId, employeeId, recommendation);
  }

  @Patch('psb/acknowledge-schedule/:vpp_id/:employee_id/:action')
  async psbAcknowledgeSchedule(
    @Param('vpp_id') vppId: string,
    @Param('employee_id') employeeId: string,
    @Param('action') action: string,
    @Body() vppAcknowledgement: VppAcknowledgement,
  ) {
    return await this.vppPsbService.psbAcknowledgeSchedule(vppId, employeeId, action, vppAcknowledgement);
  }

  @Patch('psb')
  async swapPsbMember(@Body() vppPsbSwapDto: VppPsbSwapDto) {
    return await this.vppPsbService.swapPsb(vppPsbSwapDto);
  }

  @Get(':vpp_id/psb')
  async getPsbMembers(@Param('vpp_id') vppId: string) {
    return await this.vppPsbService.getPsbMembers(vppId);
  }

  @Get(':vpp_id/non-psb')
  async getNonPsbMembers(@Param('vpp_id') vppId: string) {
    return await this.vppPsbService.getNonPsbMembers(vppId);
  }

  @Post(':vpp_id')
  async assignedPsbMember(@Param('vpp_id') vppId: string, @Body() vppPsbDTO: VppPsbDTO[]) {
    return await this.vppPsbService.assignedPsbMember(vppId, vppPsbDTO);
  }
}
