import { Module } from '@nestjs/common';
import { OccupationsDutiesResponsibilitiesService } from './occupations-duties-responsibilities.service';
import { OccupationsDutiesResponsibilitiesController } from './occupations-duties-responsibilities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationsDutiesResponsibilities } from './data/entities/occupations-duties-responsibilities.entity';


@Module({
  imports: [TypeOrmModule.forFeature([OccupationsDutiesResponsibilities])],
  providers: [OccupationsDutiesResponsibilitiesService],
  controllers: [OccupationsDutiesResponsibilitiesController],
})
export class OccupationsDutiesResponsibilitiesModule {}
