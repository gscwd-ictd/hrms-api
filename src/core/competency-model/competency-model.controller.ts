import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards, HttpException, HttpStatus, Logger, InternalServerErrorException } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated.guard';
import { CompetencyModelService } from './competency-model.service';
import { CompetencyDto, UpdateCompetencyDto } from './data/dtos/competency-model.dto';

//@UseGuards(AuthenticatedGuard)
@Controller('competency-model')
export class CompetencyModelController {
  constructor(private readonly competencyModelService: CompetencyModelService) {}

  @Post()
  async createCompetency(@Body() competencydto: CompetencyDto) {
    return await this.competencyModelService.createCompetency(competencydto);
  }

  //#region revised get competencies
  @Get('/core')
  async getAllCoreFunctions() {
    return await this.competencyModelService.getAllCoreFunctions();
  }

  @Get('/cross-cutting')
  async getAllCrossCutting() {
    return await this.competencyModelService.getAllCrossCutting();
  }

  @Get('/managerial')
  async getAllManagerial() {
    return await this.competencyModelService.getAllManagerial();
  }

  @Get('/functions')
  async getAllFunctions() {
    return await this.competencyModelService.getAllFunctionsForOccupationalGroup();
  }

  @Get('functions/:occ_id')
  async getFunctions(@Param('occ_id') occId: string) {
    return await this.competencyModelService.getFunctionsForOccupationalGroup(occId);
  }

  //#endregion
  @Get(':occupation_id')
  async getFunctionsForDropdown(@Param('occupation_id') occupationId: string) {
    return await this.competencyModelService.getFunctionsForDropdown(occupationId);
  }

  @Get('functional/:occupation_id')
  async getAllFunctionalCompetencyPerOccupation(@Param('occupation_id') occupationId: string) {
    return await this.competencyModelService.getAllFunctionalCompetencyPerOccupation(occupationId);
  }

  @Put(':competency_id')
  async updateCompetency(@Body() compdto: CompetencyDto, @Param('competency_id') competencyId: string) {
    return await this.competencyModelService.updateCompetency(compdto, competencyId);
  }

  @Put()
  async updateCompetencyAndProficiency(@Body() data: UpdateCompetencyDto) {
    return this.competencyModelService.updateCompetencyAndProficiency(data);
  }

  @Delete(':competency_id')
  async deleteCompetency(@Param('competency_id') _id: string) {
    try {
      //

      return await this.competencyModelService.removeEntity(_id);
    } catch (error) {
      if ((error.code = 'ER_ROW_IS_REFERENCED_2')) throw new HttpException("Competency's Model already set.", HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Get('functions/d/:domain_id/:og_id')
  async getAllCompetenciesByDomainAndOG(@Param('domain_id') domainId: string, @Param('og_id') ogId: string) {
    return await this.competencyModelService.getAllCompetenciesByDomainAndOG(domainId, ogId);
  }

  @Get('functions/d/:id')
  async getFunctionsByDomain(@Param('id') domainId: string) {
    return await this.competencyModelService.getEveryCompetencies(domainId);
  }
}
