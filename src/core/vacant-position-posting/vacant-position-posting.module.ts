import { PDSModule } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/pds.module';
import { PDSService } from './sub-modules/applicants/external-applicants/pds/pds.service';
import { PlantillaViewModule } from 'src/core/plantilla-positions/views/plantilla-view/plantilla-view.module';
import { ApplicantEndorsementModule } from './sub-modules/applicant-endorsement/applicant-endorsement.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacantPositionPosting } from './data/entities/vacant-position-posting.entity';
import { VacantPositionPostingViewModule } from './data/views/vacant-position-posting-view/vacant-position-posting-view.module';
import { PostingApplicants } from './sub-modules/applicants/data/entities/posting-applicants.entity';
import { PostingApplicantsDetailedViewModule } from './sub-modules/applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.module';
import { ExternalApplicants } from './sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { ExternalApplicantsService } from './sub-modules/applicants/external-applicants/external-applicants.service';
import { ApplicantController } from './sub-modules/applicants/posting-applicant.controller';
import { ApplicantsController } from './sub-modules/applicants/posting-applicants.controller';
import { ApplicantsService } from './sub-modules/applicants/posting-applicants.service';
import { VppInterviewRatingModule } from './sub-modules/vpp-interview-rating/vpp-interview-rating.module';
import { VppPositionsModule } from './sub-modules/vpp-positions/vpp-positions.module';
import { VppPsbApplicantsModule } from './sub-modules/vpp-psb-applicants/vpp-psb-applicants.module';
import { VppSchedulePsbModule } from './sub-modules/vpp-psb/vpp-psb.module';
import { VppScheduleModule } from './sub-modules/vpp-schedule/vpp-schedule.module';
import { VacantPositionPostingController } from './vacant-position-posting.controller';
import { VacantPositionPostingService } from './vacant-position-posting.service';
import { ClientsModule } from '@nestjs/microservices';
import { RedisConfigForMailMS, RedisConfigForAuthN } from 'src/global/utils/config-classes/clients.config';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacantPositionPosting, PostingApplicants, ExternalApplicants]),
    VppSchedulePsbModule,
    VppScheduleModule,
    VppPositionsModule,
    VacantPositionPostingViewModule,
    PostingApplicantsDetailedViewModule,
    VppInterviewRatingModule,
    VppPsbApplicantsModule,
    ApplicantEndorsementModule,
    PlantillaViewModule,
    PDSModule,
    ClientsModule.registerAsync([{ name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN }]),
  ],
  providers: [VacantPositionPostingService, ApplicantsService, ExternalApplicantsService],
  controllers: [VacantPositionPostingController, ApplicantsController, ApplicantController],
  exports: [VacantPositionPostingService],
})
export class VacantPositionPostingModule {}
