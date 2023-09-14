import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated.guard';
import { CompetencyModelService } from './competency-model.service';
import { CompetencyDto, UpdateCompetencyDto } from './data/dtos/competency-model.dto';

@UseGuards(AuthenticatedGuard)
@Controller('competency-model')
export class CompetencyModelController {
  constructor(private readonly competencyModelService: CompetencyModelService) {}

  @Post()
  createCompetency(@Body() competencydto: CompetencyDto) {
    return this.competencyModelService.createCompetency(competencydto);
  }

  //#region revised get competencies
  @Get('/core')
  getAllCoreFunctions() {
    return this.competencyModelService.getAllCoreFunctions();
  }

  @Get('/cross-cutting')
  getAllCrossCutting() {
    return this.competencyModelService.getAllCrossCutting();
  }

  @Get('/managerial')
  getAllManagerial() {
    return this.competencyModelService.getAllManagerial();
  }

  @Get('/functions')
  getAllFunctions() {
    return this.competencyModelService.getAllFunctionsForOccupationalGroup();
  }

  @Get('functions/:occ_id')
  getFunctions(@Param('occ_id') occId: string) {
    return this.competencyModelService.getFunctionsForOccupationalGroup(occId);
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
  updateCompetency(@Body() compdto: CompetencyDto, @Param('competency_id') competencyId: string) {
    return this.competencyModelService.updateCompetency(compdto, competencyId);
  }

  @Put()
  async updateCompetencyAndProficiency(@Body() data: UpdateCompetencyDto) {
    console.log(data);
    return this.competencyModelService.updateCompetencyAndProficiency(data);
  }

  @Delete(':competency_id')
  deleteCompetency(@Param('competency_id') _id: string) {
    return this.competencyModelService.removeEntity(_id);
  }

  @Get('functions/d/:domain_id/:og_id')
  getAllCompetenciesByDomainAndOG(@Param('domain_id') domainId: string, @Param('og_id') ogId: string) {
    return this.competencyModelService.getAllCompetenciesByDomainAndOG(domainId, ogId);
  }

  @Get('functions/d/:id')
  getFunctionsByDomain(@Param('id') domainId: string) {
    return this.competencyModelService.getEveryCompetencies(domainId);
  }
}
