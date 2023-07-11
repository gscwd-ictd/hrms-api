import { Module } from '@nestjs/common';
import { OccupationalGroupService } from './occupational-group.service';
import { OccupationalGroupController } from './occupational-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationalGroup } from './data/entities/occupational-group.entity';
import { PositionCompetencyProficiencyLevel } from '../position-competency-proficiency-level/data/entities/position-competency-proficiency-level.entity';
import { PositionCompetencyProficiencyLevelModule } from '../position-competency-proficiency-level/position-competency-proficiency-level.module';

@Module({
  imports: [TypeOrmModule.forFeature([OccupationalGroup])],
  providers: [OccupationalGroupService],
  controllers: [OccupationalGroupController],
  exports: [OccupationalGroupService],
})
export class OccupationalGroupModule {}
