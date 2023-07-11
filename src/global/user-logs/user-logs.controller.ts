import { AuthenticatedGuard } from './../auth/guards/authenticated2.guard';
import { UserLogsService } from './user-logs.service';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

@UseGuards(AuthenticatedGuard)
@Controller('/user-logs/')
export class UserLogsController {
  constructor(private readonly userLogsService: UserLogsService) {}

  @Get()
  async getAllLogs() {
    return await this.userLogsService.getAllLogs();
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
