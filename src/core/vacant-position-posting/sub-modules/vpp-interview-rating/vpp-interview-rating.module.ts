import { PDSBasicInfoModule } from './../applicants/external-applicants/pds/parts/basic-info/basic-info.module';
import { PDSBasicAddressModule } from './../applicants/external-applicants/pds/parts/basic-info/address/pds-basic-address.module';
import { ApplicantEndorsement } from './../applicant-endorsement/data/applicant-endorsement.entity';
import { ApplicantEndorsementService } from './../applicant-endorsement/applicant-endorsement.service';
import { ApplicantEndorsementModule } from './../applicant-endorsement/applicant-endorsement.module';
import { PostingApplicantsDetailedView } from 'src/core/vacant-position-posting/sub-modules/applicants/data/views/posting-applicants-detailed-view/data/posting-applicants-detailed.view';
import { PostingApplicantsDetailedViewService } from './../applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.service';
import { PostingApplicantsDetailedViewModule } from './../applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualificationStandardsModule } from 'src/core/qualification-standards/qualification-standards.module';
import { VppPsbApplicantsModule } from '../vpp-psb-applicants/vpp-psb-applicants.module';
import { VppInterviewRating } from './data/entities/vpp-interview-rating.entity';
import { VppInterviewRatingController } from './vpp-interview-rating.controller';
import { VppInterviewRatingService } from './vpp-interview-rating.service';
import { ClientsModule } from '@nestjs/microservices';
import { RedisConfigForAuthN } from 'src/global/utils/config-classes/clients.config';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';

@Module({
  imports: [
    TypeOrmModule.forFeature([VppInterviewRating, PostingApplicantsDetailedView]),
    VppPsbApplicantsModule,
    QualificationStandardsModule,
    PostingApplicantsDetailedViewModule,
    ApplicantEndorsementModule,
    ClientsModule.registerAsync([{ name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN }]),
    PDSBasicAddressModule,
    PDSBasicInfoModule,
  ],
  providers: [VppInterviewRatingService, PostingApplicantsDetailedViewService],
  controllers: [VppInterviewRatingController],
  exports: [VppInterviewRatingService],
})
export class VppInterviewRatingModule {}
