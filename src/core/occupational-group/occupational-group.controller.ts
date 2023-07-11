import { Controller, Post, Body, Put, Param, Delete, Get } from '@nestjs/common';
import { timeStamp } from 'console';
import { OccupationalGroupDto, OccupationalGroupDtoForMultiplePositions } from './data/dtos/occupational-group.dto';
import { OccupationalGroupService } from './occupational-group.service';

@Controller('occupational-group')
export class OccupationalGroupController {
  constructor(private readonly occupationalGroupService: OccupationalGroupService) {}

  @Post()
  createOccupationalGroupSinglePosition(@Body() occGroupDto: OccupationalGroupDto) {
    return this.occupationalGroupService.saveEntity(occGroupDto);
  }

  @Post(':occupation_id')
  async createOccupationalGroup(@Param('occupation_id') occupationId: string, @Body() occupationalGroupDTO: OccupationalGroupDtoForMultiplePositions) {
    return await this.occupationalGroupService.addPositionsToOccupationalGroup(occupationId, occupationalGroupDTO);
  }

  @Put(':og_id')
  async updateOccupationalGroup(@Param('og_id') _id: string, @Body() occgroup: OccupationalGroupDto) {
    return await this.occupationalGroupService.updateEntity({ _id, ...occgroup });
  }

  @Delete(':occupation_id')
  async deleteOccupationalGroup(@Param('occupation_id') occupationId: string, @Body() positionIds: OccupationalGroupDtoForMultiplePositions) {
    return await this.occupationalGroupService.deletePositionsFromOccupationalGroup(occupationId, positionIds);
  }

  @Get()
  getOccupationalGroups() {
    return this.occupationalGroupService.getOccupationalGroupAndPositions();
  }

  @Get(':id')
  async getPositionsPerOccupation(@Param('id') occupationId: string) {
    return await this.occupationalGroupService.getPositionsPerOccupation(occupationId);
  }

  @Get('occupations')
  async getCompetenciesPerOccupations() {}
}
