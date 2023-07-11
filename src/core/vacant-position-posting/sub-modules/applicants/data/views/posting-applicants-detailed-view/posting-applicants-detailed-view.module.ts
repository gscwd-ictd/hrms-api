import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostingApplicantsDetailedView } from './data/posting-applicants-detailed.view';
import { PostingApplicantsDetailedViewController } from './posting-applicants-detailed-view.controller';
import { PostingApplicantsDetailedViewService } from './posting-applicants-detailed-view.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostingApplicantsDetailedView])],
  controllers: [PostingApplicantsDetailedViewController],
  providers: [PostingApplicantsDetailedViewService],
  exports: [PostingApplicantsDetailedViewService],
})
export class PostingApplicantsDetailedViewModule {}
