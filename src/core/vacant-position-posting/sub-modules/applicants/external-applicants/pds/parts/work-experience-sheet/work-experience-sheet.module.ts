import { PDSWorkExperienceModule } from './../work-experience/pds-workexperience.module';
import { PDSWorkExperience } from './../work-experience/data/entities/pds-workexperience.entity';
import { ApplicantsService } from './../../../../posting-applicants.service';
import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkExperienceSheetDutiesService } from './contents/duties/duties.service';
import { WorkExperienceSheetAccomplishmentsService } from './contents/accomplishments/accomplishments.service';
import { WorkExperienceSheetService } from './work-experience-sheet.service';
import { WorkExperienceSheetController } from './work-experience-sheet.controller';
import { WorkExperienceSheetAccomplishmentsModule } from './contents/accomplishments/accomplishments.module';
import { Module } from '@nestjs/common';
import { WorkExperienceSheetBasicModule } from './contents/basic/basic.module';
import { WorkExperienceSheetDutiesModule } from './contents/duties/duties.module';
import { ClientsModule } from '@nestjs/microservices';
import { RedisConfigForMailMS, RedisConfigForAuthN, RedisConfigForPDSMS } from 'src/global/utils/config-classes/clients.config';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';

@Module({
  imports: [
    WorkExperienceSheetAccomplishmentsModule,
    WorkExperienceSheetBasicModule,
    WorkExperienceSheetDutiesModule,
    TypeOrmModule.forFeature([PostingApplicants]),
    PDSWorkExperienceModule,
    ClientsModule.registerAsync([{ name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN }]),
  ],
  providers: [
    WorkExperienceSheetService,
    WorkExperienceSheetAccomplishmentsService,
    WorkExperienceSheetAccomplishmentsService,
    WorkExperienceSheetDutiesService,
    ApplicantsService,
  ],
  controllers: [WorkExperienceSheetController],
  exports: [WorkExperienceSheetService, WorkExperienceSheetAccomplishmentsService, WorkExperienceSheetAccomplishmentsService, WorkExperienceSheetDutiesService, ApplicantsService],
})
export class WorkExperienceSheetModule {}
