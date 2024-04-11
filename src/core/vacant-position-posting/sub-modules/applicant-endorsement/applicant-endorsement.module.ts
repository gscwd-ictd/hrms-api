import { HiringProcessResultsModule } from './data/views/hiring-process-results-view/hiring-process-results.module';
import { PostingApplicantsDetailedViewService } from './../applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.service';
import { PostingApplicantsDetailedViewModule } from './../applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.module';
import { PostingApplicantsDetailedView } from 'src/core/vacant-position-posting/sub-modules/applicants/data/views/posting-applicants-detailed-view/data/posting-applicants-detailed.view';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantEndorsementController } from './applicant-endorsement.controller';
import { ApplicantEndorsementService } from './applicant-endorsement.service';
import { ApplicantEndorsement } from './data/applicant-endorsement.entity';
import { ApplicantEndorsementMsController } from './applicant-endorsement-ms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicantEndorsement, PostingApplicantsDetailedView]), PostingApplicantsDetailedViewModule, HiringProcessResultsModule],
  providers: [ApplicantEndorsementService, PostingApplicantsDetailedViewService],
  exports: [
    TypeOrmModule.forFeature([ApplicantEndorsement, PostingApplicantsDetailedView]),
    PostingApplicantsDetailedViewModule,
    HiringProcessResultsModule,
    ApplicantEndorsementService,
  ],
  controllers: [ApplicantEndorsementController, ApplicantEndorsementMsController],
})
export class ApplicantEndorsementModule {}
