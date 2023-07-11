import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { ApplicantsService } from './../posting-applicants.service';
import { PDSModule } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/pds.module';
import { JwtModule } from '@nestjs/jwt';
import { ExternalApplicantsController } from './external-applicants.controller';
import { ClientsModule } from '@nestjs/microservices';
import { EmailService } from 'src/global/auth/services/email.service';
import { ExternalApplicantsService } from './external-applicants.service';
import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RedisConfigForAuthN, RedisConfigForMailMS } from 'src/global/utils/config-classes/clients.config';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { readFileSync } from 'fs';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalApplicants, PostingApplicants]),
    ClientsModule.registerAsync([
      { name: MicroserviceType.EMAIL, useClass: RedisConfigForMailMS },
      { name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN },
    ]),
    PDSModule,
  ],
  providers: [ExternalApplicantsService, EmailService, ApplicantsService],
  exports: [ExternalApplicantsService],
  controllers: [ExternalApplicantsController],
})
export class ExternalApplicantsModule {}
