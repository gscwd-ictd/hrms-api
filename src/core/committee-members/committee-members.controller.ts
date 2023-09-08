import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CommitteeMembersDTO } from 'src/core/committee-members/data/dtos/committee-members.dto';
import { CommitteeMembersType } from 'src/core/committee-members/utils/types/committee-members.type';
import { CommitteeMembersService } from './committee-members.service';

@Controller('committee-members')
export class CommitteeMembersController {
  constructor(private committeeMembersService: CommitteeMembersService) {}

  @Post()
  async addCommitteeMembers(@Body() committeeMembers: CommitteeMembersType) {
    return await this.committeeMembersService.addCommitteeMembers(committeeMembers);
  }

  @Get()
  async getCommitteeMembers() {
    return await this.committeeMembersService.getCommitteeMembers();
  }

  @Get(':id')
  async getSingleCommitteeMember(@Param('id', new ParseUUIDPipe({ version: '4' })) _id: string) {
    return await this.committeeMembersService.getSingleCommitteeMember(_id);
  }

  @Get(':committee_id/employees/not/')
  async getEmployeesNotInTheCommittee(@Param('committee_id', new ParseUUIDPipe({ version: '4' })) committeeId: string) {
    return await this.committeeMembersService.getEmployeesNotInTheCommittee(committeeId);
  }

  @Put(':id')
  async updateCommitteeMember(@Param('id', new ParseUUIDPipe()) _id: string, @Body() committeeMembersDto: CommitteeMembersDTO) {
    return await this.committeeMembersService.updateEntity({ _id, ...committeeMembersDto });
  }

  @Delete()
  async removeCommitteeMembers(@Body() committeeMembers: CommitteeMembersType) {
    return await this.committeeMembersService.removeCommitteeMembers(committeeMembers);
  }
}
