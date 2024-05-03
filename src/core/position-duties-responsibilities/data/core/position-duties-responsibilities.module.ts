import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionDutiesResponsibilities } from '../entities/position-duties-responsibilities.entity';
import { PositionDutiesResponsibilitiesService } from './position-duties-responsibilities.service';
import { PositionDutiesResponsibilitiesController } from './position-duties-responsibilities.controller';
import { PositionCompetencyProficiencyLevelModule } from 'src/core/position-competency-proficiency-level/position-competency-proficiency-level.module';

@Module({
  imports: [TypeOrmModule.forFeature([PositionDutiesResponsibilities]), PositionCompetencyProficiencyLevelModule],
  controllers: [PositionDutiesResponsibilitiesController],
  providers: [PositionDutiesResponsibilitiesService],
  exports: [PositionDutiesResponsibilitiesService],
})
export class PositionDutiesResponsibilitiesModule {}
