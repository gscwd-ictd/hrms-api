import { PDSWorkExperienceUpdateDTO } from './../../parts/work-experience/data/dto/pds-workexperience.dto';
import { PDSFamilyChildrenUpdateDTO } from './../../parts/family-background/pds-family-children/data/dto/pds-family-children.dto';
import { PDSEducationUpdateDTO } from './../../parts/education/data/dtos/pds-education.dto';
import { PDSEligibilityUpdateDTO } from './../../parts/eligibility/data/dtos/pds-eligibility.dto';
import { PDSLearningDevelopmentUpdateDTO } from './../../parts/learning-development/data/dtos/pds-learning-development.dto';
import { PDSVoluntaryWorkUpdateDTO } from './../../parts/voluntary-work/data/dtos/pds-voluntary-work.dto';
import { PDSSkillsUpdateDTO } from './../../parts/other-information/skills/data/dtos/pds-skills.dto';
import { PDSRecognitionUpdateDTO } from './../../parts/other-information/recognition/data/dtos/pds-recognition.dto';
import { PDSOrganizationUpdateDTO } from './../../parts/other-information/organization/data/dtos/pds-organization.dto';
import { PDSReferencesUpdateDTO } from './../../parts/other-information/c4-questions/references/data/dtos/pds-references.dto';
import { PDSBasicAddressDTO, PDSBasicAddressUpdateDTO } from '../../parts/basic-info/address/data/dto/basic-address.dto';
import { PDSBasicGovernmentAgenciesIdsDTO } from '../../parts/basic-info/pds-basic-government-agencies-ids/data/dtos/pds-basic-government-agencies-id.dto';
import { PDSBasicPersonalInfoDTO, PDSBasicPersonalInfoDTOUpdate } from '../../parts/basic-info/pds-basic-personal-info/data/dtos/pds-basic-personal-info.dto';
import { PDSEducationElementaryDTO, PDSEducationDTO } from '../../parts/education/data/dtos/pds-education.dto';
import { PDSEligibilityDTO } from '../../parts/eligibility/data/dtos/pds-eligibility.dto';
import { PDSFamilyChildrenDTO } from '../../parts/family-background/pds-family-children/data/dto/pds-family-children.dto';
import { PDSFamilyParentsDTO } from '../../parts/family-background/pds-family-parents/data/dto/pds-family-parents.dto';
import { PDSFamilySpouseDTO } from '../../parts/family-background/pds-family-spouse/data/dto/pds-family-spouse.dto';
import { PDSLearningDevelopmentDTO } from '../../parts/learning-development/data/dtos/pds-learning-development.dto';
import { PDSCandidateResignedDTO } from '../../parts/other-information/c4-questions/candidate-resigned/data/dtos/pds-candidate-resigned.dto';
import { PDSConvictedDTO } from '../../parts/other-information/c4-questions/convicted/data/dtos/pds-convicted.dto';
import { PDSGovernmentIssuedIdDTO } from '../../parts/other-information/c4-questions/government-issued-id/data/dtos/pds-government-issued-id.dto';
import { PDSGuiltyChargedDTO } from '../../parts/other-information/c4-questions/guilty-charged/data/dtos/pds-guilty-charged.dto';
import { PDSImmigrantDTO } from '../../parts/other-information/c4-questions/immigrant/data/dtos/pds-immigrant.dto';
import { PDSIndigenousPwdSoloParentDTO } from '../../parts/other-information/c4-questions/indigenous-pwd-soloparent/data/dtos/pds-indigenous-pwd-soloparent.dto';
import { PDSOfficeRelationDTO } from '../../parts/other-information/c4-questions/office-relation/data/dtos/pds-office-relation.dto';
import { PDSReferencesDTO } from '../../parts/other-information/c4-questions/references/data/dtos/pds-references.dto';
import { PDSSeparatedServiceDTO } from '../../parts/other-information/c4-questions/separated-service/data/dtos/pds-separated-service.dto';
import { PDSOrganizationDTO } from '../../parts/other-information/organization/data/dtos/pds-organization.dto';
import { PDSRecognitionDTO } from '../../parts/other-information/recognition/data/dtos/pds-recognition.dto';
import { PDSSkillsDTO } from '../../parts/other-information/skills/data/dtos/pds-skills.dto';
import { PDSVoluntaryWorkDTO } from '../../parts/voluntary-work/data/dtos/pds-voluntary-work.dto';
import { PDSWorkExperienceDTO } from '../../parts/work-experience/data/dto/pds-workexperience.dto';

// export class PdsDTO {
//   personalInfo: PDSBasicPersonalInfoDTO;
//   governmentIssuedIds: PDSBasicGovernmentAgenciesIdsDTO;
//   address: {
//     permanentAddress: PDSBasicAddressDTO;
//     residentialAddress?: PDSBasicAddressDTO;
//   };
//   familyBackground: {
//     children?: PDSFamilyChildrenDTO[];
//     spouse?: PDSFamilySpouseDTO;
//     parents: PDSFamilyParentsDTO;
//   };
//   education: {
//     elementary: PDSEducationElementaryDTO;
//     secondary: PDSEducationDTO;
//     vocational?: PDSEducationDTO[];
//     college?: PDSEducationDTO[];
//     graduate?: PDSEducationDTO[];
//   };
//   eligibility?: PDSEligibilityDTO[];
//   workExperience?: PDSWorkExperienceDTO[];
//   voluntaryWork?: PDSVoluntaryWorkDTO[];
//   learningDevelopment?: PDSLearningDevelopmentDTO[];
//   otherInformation: {
//     skills?: PDSSkillsDTO[];
//     recognitions?: PDSRecognitionDTO[];
//     organizations?: PDSOrganizationDTO[];
//     supportingDetails: {
//       officeRelation: PDSOfficeRelationDTO;
//       guiltyCharged: PDSGuiltyChargedDTO;
//       convicted: PDSConvictedDTO;
//       separatedService: PDSSeparatedServiceDTO;
//       candidateResigned: PDSCandidateResignedDTO;
//       immigrant: PDSImmigrantDTO;
//       indigenousPwdSoloParent: PDSIndigenousPwdSoloParentDTO;
//       references: PDSReferencesDTO[];
//       governmentIssuedId: PDSGovernmentIssuedIdDTO;
//     };
//   };
// }

export class PdsDTO {
  personalInfo: PDSBasicPersonalInfoDTO;
  governmentIssuedIds: PDSBasicGovernmentAgenciesIdsDTO;
  permanentAddress: PDSBasicAddressDTO;
  residentialAddress?: PDSBasicAddressDTO;
  children?: PDSFamilyChildrenDTO[];
  spouse?: PDSFamilySpouseDTO;
  parents: PDSFamilyParentsDTO;
  elementary: PDSEducationElementaryDTO;
  secondary: PDSEducationDTO;
  vocational?: PDSEducationDTO[];
  college?: PDSEducationDTO[];
  graduate?: PDSEducationDTO[];
  eligibility?: PDSEligibilityDTO[];
  workExperience?: PDSWorkExperienceDTO[];
  voluntaryWork?: PDSVoluntaryWorkDTO[];
  learningDevelopment?: PDSLearningDevelopmentDTO[];
  skills?: PDSSkillsDTO[];
  recognitions?: PDSRecognitionDTO[];
  organizations?: PDSOrganizationDTO[];
  officeRelation: PDSOfficeRelationDTO;
  guiltyCharged: PDSGuiltyChargedDTO;
  convicted: PDSConvictedDTO;
  separatedService: PDSSeparatedServiceDTO;
  candidateResigned: PDSCandidateResignedDTO;
  immigrant: PDSImmigrantDTO;
  indigenousPwdSoloParent: PDSIndigenousPwdSoloParentDTO;
  references: PDSReferencesDTO[];
  governmentIssuedId: PDSGovernmentIssuedIdDTO;
}

export class PdsDTOUpdate {
  personalInfo: PDSBasicPersonalInfoDTOUpdate;
  governmentIssuedIds: PDSBasicGovernmentAgenciesIdsDTO;
  permanentAddress: PDSBasicAddressUpdateDTO;
  residentialAddress?: PDSBasicAddressUpdateDTO;
  children?: PDSFamilyChildrenUpdateDTO;
  spouse?: PDSFamilySpouseDTO;
  parents: PDSFamilyParentsDTO;
  elementary: PDSEducationElementaryDTO;
  secondary: PDSEducationDTO;
  vocational?: PDSEducationUpdateDTO;
  college?: PDSEducationUpdateDTO;
  graduate?: PDSEducationUpdateDTO;
  eligibility?: PDSEligibilityUpdateDTO;
  workExperience?: PDSWorkExperienceUpdateDTO;
  voluntaryWork?: PDSVoluntaryWorkUpdateDTO;
  learningDevelopment?: PDSLearningDevelopmentUpdateDTO;
  skills?: PDSSkillsUpdateDTO;
  recognitions?: PDSRecognitionUpdateDTO;
  organizations?: PDSOrganizationUpdateDTO;
  officeRelation: PDSOfficeRelationDTO;
  guiltyCharged: PDSGuiltyChargedDTO;
  convicted: PDSConvictedDTO;
  separatedService: PDSSeparatedServiceDTO;
  candidateResigned: PDSCandidateResignedDTO;
  immigrant: PDSImmigrantDTO;
  indigenousPwdSoloParent: PDSIndigenousPwdSoloParentDTO;
  references: PDSReferencesUpdateDTO;
  governmentIssuedId: PDSGovernmentIssuedIdDTO;
}
