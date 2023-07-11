
import { PDSBasicResidentialAddress } from "../../parts/basic-info/address/pds-basic-residential-address/data/entities/pds-basic-residential-address.entity";
import { PDSBasicGovernmentAgenciesIds } from "../../parts/basic-info/pds-basic-government-agencies-ids/data/entities/pds-basic-government-agencies-id.entity";
import { PDSBasicPersonalInfo } from "../../parts/basic-info/pds-basic-personal-info/data/entities/pds-basic-personal-info.entity";
import { PDSOfficeRelation } from "../../parts/other-information/c4-questions/office-relation/data/entities/pds-office-relation.entity";
import { PDSReferences } from "../../parts/other-information/c4-questions/references/data/entities/pds-references.entity";
import { PDSSeparatedService } from "../../parts/other-information/c4-questions/separated-service/data/entities/pds-separated-service.entity";
import { PDSEducationCollege } from "../../parts/education/pds-education-college/data/entities/pds-education-college.entity";
import { PDSFamilySpouse } from "../../parts/family-background/pds-family-spouse/data/entities/pds-family-spouse.entity";
import { PDSOrganization } from "../../parts/other-information/organization/data/entities/pds-organization.entity";
import { PDSBasicPermanentAddress } from "../../parts/basic-info/address/pds-basic-permanent-address/data/entities/pds-basic-permanent-address.entity";
import { PDSEducationElementary } from "../../parts/education/pds-education-elementary/data/entities/pds-education-elementary.entity";
import { PDSEducationGraduate } from "../../parts/education/pds-education-graduate/data/entities/pds-education-graduate.entity";
import { PDSEducationSecondary } from "../../parts/education/pds-education-secondary/data/entities/pds-education-secondary.entity";
import { PDSEducationVocational } from "../../parts/education/pds-education-vocational/data/entities/pds-education-vocational.entity";
import { PDSEligibility } from "../../parts/eligibility/data/entities/pds-eligibility.entity";
import { PDSFamilyChildren } from "../../parts/family-background/pds-family-children/data/entities/pds-family-children.entity";
import { PDSFamilyParents } from "../../parts/family-background/pds-family-parents/data/entities/pds-family-parents.entity";
import { PDSLearningDevelopment } from "../../parts/learning-development/data/entities/pds-learning-development.entity";
import { PDSCandidateResigned } from "../../parts/other-information/c4-questions/candidate-resigned/data/entities/pds-candidate-resigned.entity";
import { PDSConvicted } from "../../parts/other-information/c4-questions/convicted/data/entities/pds-convicted.entity";
import { PDSGovernmentIssuedId } from "../../parts/other-information/c4-questions/government-issued-id/data/entities/pds-government-issued-id.entity";
import { PDSGuiltyCharged } from "../../parts/other-information/c4-questions/guilty-charged/data/entities/pds-guilty-charged.entity";
import { PDSImmigrant } from "../../parts/other-information/c4-questions/immigrant/data/entities/pds-immigrant.entity";
import { PDSIndigenousPWDSoloParent } from "../../parts/other-information/c4-questions/indigenous-pwd-soloparent/data/entities/pds-indigenous-pwd-soloparent.entity";
import { PDSRecognition } from "../../parts/other-information/recognition/data/entities/pds-recognition.entity";
import { PDSSkills } from "../../parts/other-information/skills/data/entities/pds-skills.entity";
import { PDSVoluntaryWork } from "../../parts/voluntary-work/data/entities/pds-voluntary-work.entity";
import { PDSWorkExperience } from "../../parts/work-experience/data/entities/pds-workexperience.entity";


export const PdsEntities = [
    PDSBasicPersonalInfo,
    PDSBasicPermanentAddress,
    PDSBasicGovernmentAgenciesIds,
    PDSBasicResidentialAddress,

    PDSEducationElementary,
    PDSEducationSecondary,
    PDSEducationVocational,
    PDSEducationCollege,
    PDSEducationGraduate,

    PDSFamilySpouse,
    PDSFamilyChildren,
    PDSFamilyParents,
    
    PDSEligibility,
    PDSWorkExperience,
    PDSVoluntaryWork,
    PDSLearningDevelopment,

    PDSSkills,
    PDSRecognition,
    PDSOrganization,

    PDSGuiltyCharged,
    PDSOfficeRelation,
    PDSConvicted,
    PDSSeparatedService,
    PDSCandidateResigned,
    PDSIndigenousPWDSoloParent,
    PDSReferences,
    PDSGovernmentIssuedId,
    PDSImmigrant
];