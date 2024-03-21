import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller({ path: 'stats' })
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('count/employees')
  async countEmployees() {
    return await this.statsService.countEmployees();
  }

  @Get('count/prf')
  async countApprovedPrf() {
    return await this.statsService.countApprovedPrf();
  }

  @Get('count/applicants')
  async countApplicants() {
    return await this.statsService.countApplicants();
  }

  @Get('current/birthdays')
  async findCurrentBirthdays() {
    return await this.statsService.findCurrentBirthdays();
  }
}
