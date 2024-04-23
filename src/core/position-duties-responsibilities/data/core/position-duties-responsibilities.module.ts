import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionDutiesResponsibilities } from '../entities/position-duties-responsibilities.entity';
import { PositionDutiesResponsibilitiesService } from './position-duties-responsibilities.service';

@Module({
  imports: [TypeOrmModule.forFeature([PositionDutiesResponsibilities])],
  controllers: [],
  providers: [PositionDutiesResponsibilitiesService],
  exports: [PositionDutiesResponsibilitiesService],
})
export class PositionDutiesResponsibilitiesModule {}
