import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DutiesResponsibilities } from './data/entities/duties-resposibilities.entity';
import { DutiesResponsibilitiesController } from './duties-responsibilities.controller';
import { DutiesResponsibilitiesService } from './duties-responsibilities.service';

@Module({
  imports: [TypeOrmModule.forFeature([DutiesResponsibilities])],
  providers: [DutiesResponsibilitiesService],
  controllers: [DutiesResponsibilitiesController],
})
export class DutiesResponsibilitiesModule {}
