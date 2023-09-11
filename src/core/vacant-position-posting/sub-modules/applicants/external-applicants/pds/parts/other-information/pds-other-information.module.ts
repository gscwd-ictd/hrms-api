import { Module } from '@nestjs/common';
import { PDSCandidateResignedModule } from './c4-questions/candidate-resigned/pds-candidate-resigned.module';
import { PDSConvictedModule } from './c4-questions/convicted/pds-convicted.module';
import { PDSGovernmentIssuedIdModule } from './c4-questions/government-issued-id/pds-government-issued-id.module';
import { PDSGuiltyChargedModule } from './c4-questions/guilty-charged/pds-guilty-charged.module';
import { PDSImmigrantModule } from './c4-questions/immigrant/pds-immigrant.module';
import { PDSIndigenousPWDSoloParentModule } from './c4-questions/indigenous-pwd-soloparent/pds-indigenous-pwd-soloparent.module';
import { PDSOfficeRelationModule } from './c4-questions/office-relation/pds-office-relation.module';
import { PDSReferencesModule } from './c4-questions/references/pds-references.module';
import { PDSSeparatedServiceModule } from './c4-questions/separated-service/pds-separated-service.module';
import { PDSOrganizationModule } from './organization/pds-organization.module';
import { PDSRecognitionModule } from './recognition/pds-recognition.module';
import { PDSSkillsModule } from './skills/pds-skills.module';

@Module({
  imports: [
    PDSSkillsModule,
    PDSRecognitionModule,
    PDSOrganizationModule,
    PDSOfficeRelationModule,
    PDSGuiltyChargedModule,
    PDSConvictedModule,
    PDSSeparatedServiceModule,
    PDSCandidateResignedModule,
    PDSImmigrantModule,
    PDSIndigenousPWDSoloParentModule,
    PDSReferencesModule,
    PDSGovernmentIssuedIdModule,
  ],

  exports: [
    PDSSkillsModule,
    PDSRecognitionModule,
    PDSOrganizationModule,
    PDSOfficeRelationModule,
    PDSGuiltyChargedModule,
    PDSConvictedModule,
    PDSSeparatedServiceModule,
    PDSCandidateResignedModule,
    PDSImmigrantModule,
    PDSIndigenousPWDSoloParentModule,
    PDSReferencesModule,
    PDSGovernmentIssuedIdModule,
  ],
})
export class PDSOtherInformationModule {}
