import { Module } from '@nestjs/common';
import { OccupationalGroupDutiesResponsibilitiesService } from './occupational-group-duties-responsibilities.service';
import { OccupationalGroupDutiesResponsibilitiesController } from './occupational-group-duties-responsibilities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationalGroupDutiesResponsibilities } from './data/entities/occupational-group-duties-responsibilities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OccupationalGroupDutiesResponsibilities])],
  providers: [OccupationalGroupDutiesResponsibilitiesService],
  controllers: [OccupationalGroupDutiesResponsibilitiesController],
  exports: [TypeOrmModule.forFeature([OccupationalGroupDutiesResponsibilities]), OccupationalGroupDutiesResponsibilitiesService],
})
export class OccupationalGroupDutiesResponsibilitiesModule {}
