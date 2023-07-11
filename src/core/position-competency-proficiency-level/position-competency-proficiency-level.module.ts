import { Module } from '@nestjs/common';
import { PositionCompetencyProficiencyLevelService } from './position-competency-proficiency-level.service';
import { PositionCompetencyProficiencyLevelController } from './position-competency-proficiency-level.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationalGroupService } from '../occupational-group/occupational-group.service';
import { CompetencyModelService } from '../competency-model/competency-model.service';
import { CompetencyModel } from '../competency-model/data/entities/competency-model.entity';
import { ProficiencyService } from '../proficiency/proficiency.service';
import { SalaryGradeService } from '../salary-grade/salary-grade.service';
import { CompetencyModelView } from '../competency-model/data/entities/views/competency-model-view.entity';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { OccupationalGroup } from '../occupational-group/data/entities/occupational-group.entity';
import { PlantillaPositions } from '../plantilla-positions/data/entities/plantilla-positions.entity';
import { Proficiency } from '../proficiency/data/entities/proficiency.entity';
import { SalaryGrade } from '../salary-grade/data/entities/salary-grade.entity';
import { PositionCompetencyProficiencyLevel } from './data/entities/position-competency-proficiency-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PositionCompetencyProficiencyLevel, OccupationalGroup, CompetencyModel, Proficiency, SalaryGrade, PlantillaPositions, CompetencyModelView])],
  providers: [PositionCompetencyProficiencyLevelService, OccupationalGroupService, CompetencyModelService, ProficiencyService, SalaryGradeService, PlantillaPositionsService],
  controllers: [PositionCompetencyProficiencyLevelController],
  exports: [
    TypeOrmModule.forFeature([PositionCompetencyProficiencyLevel, OccupationalGroup, CompetencyModel, Proficiency, SalaryGrade, PlantillaPositions, CompetencyModelView]),
    PositionCompetencyProficiencyLevelService,
    OccupationalGroupService,
    CompetencyModelService,
    ProficiencyService,
    SalaryGradeService,
    PlantillaPositionsService,
  ],
})
export class PositionCompetencyProficiencyLevelModule {}
