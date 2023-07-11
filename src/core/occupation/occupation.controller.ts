import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated.guard';
import { ScopeGuard } from 'src/global/auth/guards/scope.guard';
import { OccupationDto } from './data/dtos/occupation.dto';
import { OccupationService } from './occupation.service';

@Controller('occupations')
export class OccupationController {
  constructor(private readonly occupationService: OccupationService) {}

  @Post()
  async createOccupation(@Body() occupation: OccupationDto) {
    return await this.occupationService.saveEntity(occupation);
  }

  @Get()
  async findAllOccupations() {
    return await this.occupationService.getAllOccupations();
  }

  @Get('/:id')
  async findOccupationById(@Param('id') _id: string) {
    return await this.occupationService.occupationRepository.findOne({ where: { _id } });
  }

  @Put('/:id')
  async updateOccupation(@Param('id') _id: string, @Body() occupation: OccupationDto) {
    return await this.occupationService.updateEntity({ _id, ...occupation });
  }

  @Delete('/:id')
  async deleteOccupation(@Param('id') _id: string) {
    return await this.occupationService.removeEntity(_id);
  }
}
