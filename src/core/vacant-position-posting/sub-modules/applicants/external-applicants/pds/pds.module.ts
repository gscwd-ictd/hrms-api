import { Module } from '@nestjs/common';
import { PDSBasicInfoModule } from './parts/basic-info/basic-info.module';
import { PDSEducationModule } from './parts/education/pds-education.module';
import { PDSEligibilityModule } from './parts/eligibility/pds-eligibility.module';
import { PDSFamilyBackgroundModule } from './parts/family-background/pds-family-background.module';
import { PDSLearningDevelopmentModule } from './parts/learning-development/pds-learning-development.module';
import { PDSOtherInformationModule } from './parts/other-information/pds-other-information.module';
import { PDSVoluntaryWorkModule } from './parts/voluntary-work/pds-voluntary-work.module';
import { WorkExperienceSheetModule } from './parts/work-experience-sheet/work-experience-sheet.module';
import { PDSWorkExperienceModule } from './parts/work-experience/pds-workexperience.module';
import { PDSController } from './pds.controller';
import { PDSService } from './pds.service';

@Module({
  imports: [
    PDSBasicInfoModule,
    PDSFamilyBackgroundModule,
    PDSEducationModule,
    PDSEligibilityModule,
    PDSWorkExperienceModule,
    PDSLearningDevelopmentModule,
    PDSVoluntaryWorkModule,
    PDSOtherInformationModule,
    WorkExperienceSheetModule,
  ],
  controllers: [PDSController],
  providers: [PDSService],
  exports: [
    PDSBasicInfoModule,
    PDSFamilyBackgroundModule,
    PDSEducationModule,
    PDSEligibilityModule,
    PDSWorkExperienceModule,
    PDSLearningDevelopmentModule,
    PDSVoluntaryWorkModule,
    PDSOtherInformationModule,
    PDSService,
  ],
})
export class PDSModule {}
