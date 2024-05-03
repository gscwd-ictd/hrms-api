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

  /*  @Patch()
  async updatePositionDutiesResponsibilities(@Body() data: UpdatePositionDutiesResponsibilitiesDto) {
    return await this.positionDutiesResponsibilitiesService.updatePositionDutiesResponsibilities(data);
  }

  @Get('position/:positionId')
  async findPositionDutiesResponsibilities(@Param('positionId') positionId: string) {
    return await this.positionDutiesResponsibilitiesService.findPositionDutiesResponsibilities(positionId);
  } */
}
