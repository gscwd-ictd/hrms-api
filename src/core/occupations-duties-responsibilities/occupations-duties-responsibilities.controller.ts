import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OccupationDutiesResponsibilitiesDeleteDTO, OccupationDutiesResponsibilitiesDTO } from './data/dtos/occupations-duties-responsibilities.dto';
import { OccupationsDutiesResponsibilitiesService } from './occupations-duties-responsibilities.service';

@Controller('occupation-duties-responsibilities')
export class OccupationsDutiesResponsibilitiesController {
  constructor(private readonly occupationsDutiesResponsibilitiesService: OccupationsDutiesResponsibilitiesService) {}

  @Post(':occupation_id')
  async assignDRtoOccupation(@Param('occupation_id') occupationId: string, @Body() odrDto: OccupationDutiesResponsibilitiesDTO) {
    return await this.occupationsDutiesResponsibilitiesService.assignDRtoOccupation(occupationId, odrDto);
  }

  @Delete()
  async removeDRfromOccupation(@Body() odrDto: OccupationDutiesResponsibilitiesDeleteDTO) {
    return await this.occupationsDutiesResponsibilitiesService.removeDRfromOccupation(odrDto);
  }

  @Get()
  async getODR() {
    return await this.occupationsDutiesResponsibilitiesService.findEntityAll();
  }

  @Get(':occupation_id')
  async getODRPerOccupation(@Param('occupation_id') occupationId: string) {
    return await this.occupationsDutiesResponsibilitiesService.getODRPerOccupation(occupationId);
  }

  @Get(':occupation_id/available')
  async getAvailableDutiesResponsibilities(@Param('occupation_id') occupationId: string) {
    return await this.occupationsDutiesResponsibilitiesService.getAvailableDutiesResponsibilities(occupationId);
  }
}
