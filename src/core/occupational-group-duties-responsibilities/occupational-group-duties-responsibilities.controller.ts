import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { OgdrDto, UpdateOgdrDto } from './data/dtos/occupational-group-duties-responsibilities.dto';
import { OccupationalGroupDutiesResponsibilitiesService } from './occupational-group-duties-responsibilities.service';

@Controller('occupational-group-duties-responsibilities')
export class OccupationalGroupDutiesResponsibilitiesController {
  constructor(private readonly ogdrService: OccupationalGroupDutiesResponsibilitiesService) {}

  @Post()
  async createOgdr(@Body() ogdr: OgdrDto) {
    return await this.ogdrService.saveEntity(ogdr);
  }

  @Patch(':emp_id/:position_id')
  async updateDRPercentagePerPosition(@Param('position_id') positionId: string, @Body() ogdrDTO: UpdateOgdrDto) {
    console.log('test');
    return await this.ogdrService.updateDRPercentagePerPosition(positionId, ogdrDTO);
  }

  //@UseInterceptors(AssignDutiesResponsibilitiesInterceptor)
  @Post(':emp_position_id/:position_id')
  async assignDutiesResponsibilities(@Param('emp_position_id') empPositionId: string, @Param('position_id') positionId: string, @Body() ogdrDTO: OgdrDto) {
    return await this.ogdrService.assignDutiesResponsibilities(empPositionId, positionId, ogdrDTO);
  }

  @Get()
  async getOgdr() {
    return await this.ogdrService.entityRepository.find();
  }

  @Get(':position_id/pending')
  async getPendingDutiesAndResponsibilities(@Param('position_id') positionId: string) {
    return await this.ogdrService.getPendingDutiesAndResponsibilities(positionId);
  }

  @Get(':position_id/finished')
  async getFinishedDutiesAndResponsibilities(@Param('position_id') positionId: string) {
    return await this.ogdrService.getFinishedDutiesAndResponsibilities(positionId);
  }

  @Get(':position_id')
  async getPositionsUnderManager(@Param('position_id') positionId: string) {
    return await this.ogdrService.getPermanentUnfilledFilledUnderManager(positionId);
  }

  @Get('duties-responsibilities/:position_id')
  async getDRPool(@Param('position_id') positionId: string) {
    return await this.ogdrService.getDRPool(positionId);
  }

  @Get(':emp_position_id/:position_id')
  async getPositionDutiesResponsibilities(@Param('emp_position') empPositionId: string, @Param('position_id') positionId: string) {
    return await this.ogdrService.getPositionDutiesResponsibilities(empPositionId, positionId);
  }

  @Delete(':emp_position_id/:position_id')
  async removeDutiesRes0ponsibilities(@Param('position_id') positionId: string, @Body() ogdrDTO: OgdrDto) {
    return await this.ogdrService.removeDutiesResponsibilities(positionId, ogdrDTO);
  }
}
