import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DutiesResponsibilitiesDTO } from './data/dto/duties-responsibilities.dto';
import { DutiesResponsibilitiesService } from './duties-responsibilities.service';

@Controller('duties-responsibilities')
export class DutiesResponsibilitiesController {
  constructor(private readonly dutiesResponsibilitiesService: DutiesResponsibilitiesService) {}

  @Get()
  async getPool() {
    return await this.dutiesResponsibilitiesService.getPool();
  }

  @Post()
  async addDutiesResponsibilites(@Body() dutiesResponsibilitiesDTO: DutiesResponsibilitiesDTO) {
    return await this.dutiesResponsibilitiesService.addDutiesResponsibilites(dutiesResponsibilitiesDTO);
  }

  @Put(':duty_responsibility_id')
  async updateDutiesResponsibilities(@Param('duty_responsibility_id') dutyResponsibilityId, @Body() dutiesResponsibilitiesDTO: DutiesResponsibilitiesDTO) {
    return await this.dutiesResponsibilitiesService.updateDutiesResponsibilities(dutyResponsibilityId, dutiesResponsibilitiesDTO);
  }

  @Delete(':duty_responsibility_id')
  async removeDutiesResponsibilities(@Param('duty_responsibility_id') dutyResponsibilityId: string) {
    return await this.dutiesResponsibilitiesService.removeDutiesResponsibilities(dutyResponsibilityId);
  }
}
