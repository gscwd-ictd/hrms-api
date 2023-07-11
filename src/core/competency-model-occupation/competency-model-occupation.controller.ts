import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CompetencyModelOccupationService } from './competency-model-occupation.service';
import { CompetencyModelOccupationDTO } from './data/dtos/competency-model-occupation.dto';
import { Competencies } from './utils/types/competency-model-occupation.types';

//@UseGuards(AuthenticatedGuard)
@Controller('competency-model-occupation')
export class CompetencyModelOccupationController {
  constructor(private competencyModelOccupationService: CompetencyModelOccupationService) {}

  @Get(':id')
  async getFunctionsCrossCuttingFunctions(@Param('id') id: string) {
    return await this.competencyModelOccupationService.getCompetencyModelsPerOccupation(id);
  }

  @Post(':occupation_id')
  async saveCompetencyModelOccupation(@Param('occupation_id') occupationId: string, @Body() competencies: Competencies) {
    return await this.competencyModelOccupationService.addCompetenciesToOccupation(occupationId, competencies);
  }

  @Put(':id')
  async updateCompetencyModelOccupation(@Body() competencyModelOccupationDTO: CompetencyModelOccupationDTO, @Param('id') _id: string) {
    return await this.competencyModelOccupationService.updateEntity({ _id, ...competencyModelOccupationDTO });
  }

  @Delete(':occupation_id')
  async deleteCompetencyModelOccupation(@Param('occupation_id') occupationId: string, @Body() competencies: Competencies) {
    return await this.competencyModelOccupationService.removeCompetenciesOccupation(occupationId, competencies);
  }
}
