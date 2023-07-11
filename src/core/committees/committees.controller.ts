import { UserLogsInterceptor } from './../../global/user-logs/interceptors/user-logs.interceptor';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated2.guard';
import { Body, Controller, Post, Put, Param, Delete, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommitteeDto } from 'src/core/committees/data/dtos/committee.dto';
import { CommitteesService } from './committees.service';

@UseGuards(AuthenticatedGuard)
@Controller('committees')
export class CommitteesController {
  constructor(private committeeService: CommitteesService) {}

  @Get()
  async getCommittees() {
    return await this.committeeService.getCommittees();
  }

  @UseInterceptors(UserLogsInterceptor)
  @Get(':id')
  async getSingleCommittee(@Param('id') _id: string) {
    return await this.committeeService.getSingleCommittee(_id);
  }

  @UseInterceptors(UserLogsInterceptor)
  @Post()
  async addCommittee(@Body() committeeDto: CommitteeDto) {
    return await this.committeeService.addCommittee(committeeDto);
  }

  @UseInterceptors(UserLogsInterceptor)
  @Put(':id')
  async updateCommittee(@Param('id') _id: string, @Body() committeeDto: CommitteeDto) {
    return await this.committeeService.updateCommittee(_id, committeeDto);
  }

  @UseInterceptors(UserLogsInterceptor)
  @Delete(':id')
  async deleteCommittee(@Param('id') _id: string) {
    return await this.committeeService.deleteCommittee(_id);
  }
}
