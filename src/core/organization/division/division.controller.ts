import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DivisionDto } from './data/dtos/division.dto';
import { DivisionService } from './division.service';

@Controller('divisions')
export class DivisionsController {
  constructor(private readonly divService: DivisionService) {}

  @Post()
  async AddDivision(@Body() divDto: DivisionDto) {
    return await this.divService.saveEntity(divDto);
  }

  @Put(':id')
  async updateDivision(@Param('id') _id: string, @Body() divDto: DivisionDto) {
    return await this.divService.updateEntity({ _id, ...divDto });
  }

  @Delete(':id')
  async deleteDivision(@Param('id') _id: string) {
    return await this.divService.removeEntity(_id);
  }

  @Get(':id')
  async findDivisionById(@Param('id') _id: string) {
    return await this.divService.findEntityById(_id);
  }

  @Get()
  async findAllDivisions() {
    return await this.divService.findAllDivisions();
  }
}
