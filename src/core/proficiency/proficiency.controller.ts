import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated.guard';
import { Controller, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProficiencyDto } from 'src/core/proficiency/data/dtos/proficiency.dto';
import { ProficiencyService } from './proficiency.service';

@UseGuards(AuthenticatedGuard)
@Controller('proficiency')
export class ProficiencyController {
  constructor(private readonly proficiencyService: ProficiencyService) {}

  @Get('/:compid')
  getCompetencyProficiency(@Param('compid') compId: string) {
    return this.proficiencyService.getProficienciesByCompId(compId);
  }

  @Put(':prof_id')
  updateProficiency(@Param('prof_id') _id: string, profdto: ProficiencyDto) {
    return this.proficiencyService.updateEntity({ _id, ...profdto });
  }

  @Delete(':prof_id')
  deleteProficiency(@Param('prof_id') _id: string) {
    return this.proficiencyService.removeEntity(_id);
  }
}
