import { WorkExperienceSheetAccomplishmentsController } from './accomplishments.controller';
import { WorkExperienceSheetAccomplishmentsService } from './accomplishments.service';
import { WorkExperienceSheetAccomplishments } from './data/accomplishments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([WorkExperienceSheetAccomplishments])],
  providers: [WorkExperienceSheetAccomplishmentsService],
  controllers: [WorkExperienceSheetAccomplishmentsController],
  exports: [WorkExperienceSheetAccomplishmentsService, TypeOrmModule.forFeature([WorkExperienceSheetAccomplishments])],
})
export class WorkExperienceSheetAccomplishmentsModule {}
