import { WorkExperienceSheetDutiesController } from './duties.controller';
import { WorkExperienceSheetDutiesService } from './duties.service';
import { WorkExperienceSheetDuties } from './data/duties.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkExperienceSheetAccomplishmentsModule } from './../accomplishments/accomplishments.module';
import { WorkExperienceSheetBasicModule } from './../basic/basic.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([WorkExperienceSheetDuties])],
  providers: [WorkExperienceSheetDutiesService],
  controllers: [WorkExperienceSheetDutiesController],
  exports: [WorkExperienceSheetDutiesService, TypeOrmModule.forFeature([WorkExperienceSheetDuties])],
})
export class WorkExperienceSheetDutiesModule {}
