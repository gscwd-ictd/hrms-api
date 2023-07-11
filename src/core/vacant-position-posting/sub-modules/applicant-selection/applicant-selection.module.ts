import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantSelectionController } from './applicant-selection.controller';
import { ApplicantSelectionService } from './applicant-selection.service';
import { ApplicantSelection } from './data/applicant-selection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicantSelection])],
  controllers: [ApplicantSelectionController],
  providers: [ApplicantSelectionService],
  exports: [ApplicantSelectionService],
})
export class ApplicantSelectionModule {}
