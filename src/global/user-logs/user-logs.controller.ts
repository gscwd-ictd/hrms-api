import { AuthenticatedGuard } from './../auth/guards/authenticated2.guard';
import { UserLogsService } from './user-logs.service';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

@UseGuards(AuthenticatedGuard)
@Controller('/user-logs/')
export class UserLogsController {
  constructor(private readonly userLogsService: UserLogsService) {}

  /** ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD (default: the last 30 days) */
  @Get()
  async getAllLogs(@Query('date_from') dateFrom: string, @Query('date_to') dateTo: string) {
    return await this.userLogsService.getAllLogs(dateFrom, dateTo);
  }

  @Get('year-month/:yearmonth')
  async getLogsByYearMonth(@Param('yearmonth') yearMonth: string) {
    return await this.userLogsService.getLogsByYearMonth(yearMonth);
  }

  @Get('full')
  async getAllDetailedLogs() {
    return await this.userLogsService.getAllDetailedLogs();
  }

  @Get(':_id')
  async getLogById(@Param('_id') _id: string) {
    return await this.userLogsService.getLogById(_id);
  }
}
