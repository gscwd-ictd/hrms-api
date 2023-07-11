import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { PcplDeleteDTO, PcplDTO, PcplUpdateDTO } from './data/dtos/position-competency-proficiency-level.dto';
import { PositionCompetencyProficiencyLevelService } from './position-competency-proficiency-level.service';

@Controller('competency-proficiency-level')
export class PositionCompetencyProficiencyLevelController {
  constructor(private readonly pcplService: PositionCompetencyProficiencyLevelService) {}

  @Get('single/:posId')
  async getAll(@Param('posId') posId: string) {
    return await this.pcplService.getAllCompetencyProficiencies(posId);
  }

  @Get('/position/:position_id')
  async getOccupationCompetenciesForPositionForDropdown(@Param('position_id') positionId: string) {
    return await this.pcplService.getOccupationCompetenciesForPositionForDropdown(positionId);
  }

  @Get(':occupation_id')
  async getAllComptenciesPerOccupations(@Param('occupation_id') occupationId: string) {
    return await this.pcplService.getAllComptenciesPerOccupations(occupationId);
  }

  @Get('single/functional/:posId')
  async getAllFunctional(@Param('posId') posId: string) {
    return await this.pcplService.getAllCompetencyProficienciesFunctional(posId);
  }

  @Post(':position_id')
  async addCompetencyPerPosition(@Param('position_id') positionId: string, @Body() proficiencyIds: PcplDTO) {
    return await this.pcplService.assignCompetenciesToPosition(positionId, proficiencyIds);
  }

  @Patch()
  async updatePcpl(@Body() pcplRankFileUpdateDTO: PcplUpdateDTO) {
    return await this.pcplService.updateRankandFilePcpl(pcplRankFileUpdateDTO);
  }

  @Delete()
  async removeCompetenciesFromPosition(@Body() pcplDeleteDTO: PcplDeleteDTO) {
    return await this.pcplService.removeCompetenciesFromPosition(pcplDeleteDTO);
  }
}
