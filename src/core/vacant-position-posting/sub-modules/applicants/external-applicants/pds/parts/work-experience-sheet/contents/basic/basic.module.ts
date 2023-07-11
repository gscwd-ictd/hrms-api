import { WorkExperienceSheetBasicService } from './basic.service';
import { WorkExperienceSheetBasicController } from './basic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { WorkExperienceSheetBasic } from './data/basic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkExperienceSheetBasic])],
  controllers: [WorkExperienceSheetBasicController],
  providers: [WorkExperienceSheetBasicService],
  exports: [WorkExperienceSheetBasicService, TypeOrmModule.forFeature([WorkExperienceSheetBasic])],
})
export class WorkExperienceSheetBasicModule {}
