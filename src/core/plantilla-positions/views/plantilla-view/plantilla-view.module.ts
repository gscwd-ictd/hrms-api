import { PositionCompetencyProficiencyLevelModule } from 'src/core/position-competency-proficiency-level/position-competency-proficiency-level.module';
import { QualificationStandardsModule } from 'src/core/qualification-standards/qualification-standards.module';
import { Module } from '@nestjs/common';
import { PlantillaViewService } from './plantilla-view.service';
import { PlantillaViewController } from './plantilla-view.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentService } from '../../../organization/department/department.service';
import { OfficeService } from '../../../organization/office/office.service';
import { OccupationsDutiesResponsibilitiesService } from '../../../occupations-duties-responsibilities/occupations-duties-responsibilities.service';
import { JwtStrategy } from 'src/global/auth/strategies/jwt.strategy';
import { PlantillaPositionsService } from '../../plantilla-positions.service';
import { PlantillaView } from './data/entities/plantilla.view';
import { OccupationsDutiesResponsibilities } from 'src/core/occupations-duties-responsibilities/data/entities/occupations-duties-responsibilities.entity';
import { Departments } from 'src/core/organization/department/data/entities/departments.entity';
import { Divisions } from 'src/core/organization/division/data/entities/divisions.entity';
import { DivisionService } from 'src/core/organization/division/division.service';
import { Office } from 'src/core/organization/office/data/entities/office.entity';
import { PlantillaPositions } from '../../data/entities/plantilla-positions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantillaView, Divisions, Departments, Office, OccupationsDutiesResponsibilities, PlantillaPositions]),
    QualificationStandardsModule,
    PositionCompetencyProficiencyLevelModule,
  ],
  providers: [PlantillaViewService, DivisionService, DepartmentService, OfficeService, OccupationsDutiesResponsibilitiesService, PlantillaPositionsService, JwtStrategy],
  controllers: [PlantillaViewController],
  exports: [
    TypeOrmModule.forFeature([PlantillaView, Divisions, Departments, Office, OccupationsDutiesResponsibilities, PlantillaPositions]),
    QualificationStandardsModule,
    PositionCompetencyProficiencyLevelModule,
    PlantillaViewService,
    DivisionService,
    DepartmentService,
    OfficeService,
    OccupationsDutiesResponsibilitiesService,
    PlantillaPositionsService,
    JwtStrategy,
  ],
})
export class PlantillaViewModule {}
