import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PositionDutiesResponsibilitiesService } from './position-duties-responsibilities.service';
import { CreatePositionDutiesResponsibilitiesDto, UpdatePositionDutiesResponsibilitiesDto } from '../dtos/position-duties-responsibilities.dto';

@Controller('position-duties-responsibilities')
export class PositionDutiesResponsibilitiesController {
  constructor(private readonly positionDutiesResponsibilitiesService: PositionDutiesResponsibilitiesService) {}

  @Post()
  async createPositionDutiesResponsibilities(@Body() data: CreatePositionDutiesResponsibilitiesDto) {
    return await this.positionDutiesResponsibilitiesService.createPositionDutiesResponsibilities(data);
  }

  @Patch()
  async updatePositionDutiesResponsibilities(@Body() data: UpdatePositionDutiesResponsibilitiesDto) {
    return await this.positionDutiesResponsibilitiesService.updatePositionDutiesResponsibilities(data);
  }

  @Get(':supervisorPositionId/pending')
  async getPendingDutiesAndResponsibilities(@Param('supervisorPositionId') supervisorPositionId: string) {
    return await this.positionDutiesResponsibilitiesService.getPendingDutiesAndResponsibilities(supervisorPositionId);
  }

  @Get(':supervisorPositionId/finished')
  async getFinishedDutiesAndResponsibilities(@Param('supervisorPositionId') supervisorPositionId: string) {
    return await this.positionDutiesResponsibilitiesService.getFinishedDutiesAndResponsibilities(supervisorPositionId);
  }

  @Get(':supervisorPositionId')
  async getPositionsUnderManager(@Param('supervisorPositionId') supervisorPositionId: string) {
    return await this.positionDutiesResponsibilitiesService.getPositionsUnderManager(supervisorPositionId);
  }

  @Get(':supervisorPositionId/:positionId')
  async getPositionDutiesResponsibilities(@Param('supervisorPositionId') supervisorPositionId: string, @Param('positionId') positionId: string) {
    return await this.positionDutiesResponsibilitiesService.getPositionDutiesResponsibilities(positionId);
  }

  @Get()
  async getAllPositionDutiesAndResponsibilities() {
    return await this.positionDutiesResponsibilitiesService.getAllPositionDutiesAndResponsibilities();
  }
}
