import { PositionDescriptionFormWorkingConditionController } from './working-condition.controller';
import { PositionDescriptionFormWorkingConditionService } from './working-condition.service';
import { PositionDescriptionFormWorkingCondition } from './data/working-condition.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([PositionDescriptionFormWorkingCondition])],
  providers: [PositionDescriptionFormWorkingConditionService],
  exports: [PositionDescriptionFormWorkingConditionService, TypeOrmModule.forFeature([PositionDescriptionFormWorkingCondition])],
  controllers: [PositionDescriptionFormWorkingConditionController],
})
export class PositionDescriptionFormWorkingConditionModule {}
