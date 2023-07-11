import { PrfTrailInterceptor } from './interceptors/prf-trail.interceptor';
import { Body, Controller, Get, Param, Patch, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { PrfTrailDTO } from './data/dtos/prf-trail.dto';
import { PrfTrailGuard } from './guards/prf-trail.guard';
import { PrfTrailService } from './prf-trail.service';

@Controller('prf-trail')
export class PrfTrailController {
  constructor(private prfTrailService: PrfTrailService) {}
  @Get()
  async getPrfsToBeSigned(employeeId: string) {}

  @Get(':prf_details_id')
  async getTrail(@Param('prf_details_id') prfDetailsId: string) {
    return await this.prfTrailService.getPrfTrail(prfDetailsId);
  }

  //@UseInterceptors(PrfTrailInterceptor)
  @Get('employee/:employee_id')
  async getPrfsForApproval(@Param('employee_id') employeeId: string) {
    return await this.prfTrailService.getPrfsForApproval(employeeId);
  }

  @Patch(':prf_details_id')
  async updatePrf(@Param('prf_details_id') prfDetailsId: string, @Body() prfTrailDto: PrfTrailDTO) {
    return await this.prfTrailService.updatePrf(prfDetailsId, prfTrailDto);
  }
}
