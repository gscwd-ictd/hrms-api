import { PDSEducationSecondary } from './parts/education/pds-education-secondary/data/entities/pds-education-secondary.entity';
import { PDSEducationElementary } from './parts/education/pds-education-elementary/data/entities/pds-education-elementary.entity';
import { PDSFamilyParents } from './parts/family-background/pds-family-parents/data/entities/pds-family-parents.entity';
import { PDSFamilySpouse } from './parts/family-background/pds-family-spouse/data/entities/pds-family-spouse.entity';
import { PDSBasicResidentialAddress } from './parts/basic-info/address/pds-basic-residential-address/data/entities/pds-basic-residential-address.entity';
import { PDSBasicPermanentAddress } from './parts/basic-info/address/pds-basic-permanent-address/data/entities/pds-basic-permanent-address.entity';
import { PDSBasicPersonalInfo } from './parts/basic-info/pds-basic-personal-info/data/entities/pds-basic-personal-info.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getManager, getRepository } from 'typeorm';
import { PdsDTO, PdsDTOUpdate } from './data/dtos/pds.dto';
import { PDSBasicPermanentAddressService } from './parts/basic-info/address/pds-basic-permanent-address/pds-basic-permanent-address.service';
import { PDSBasicResidentialAddressService } from './parts/basic-info/address/pds-basic-residential-address/pds-basic-residential-address.service';
import { PDSBasicGovernmentAgenciesIdsService } from './parts/basic-info/pds-basic-government-agencies-ids/pds-basic-government-agencies-ids.service';
import { PDSBasicPersonalInfoService } from './parts/basic-info/pds-basic-personal-info/pds-basic-personal-info.service';
import { PDSEducationCollegeService } from './parts/education/pds-education-college/pds-education-college.service';
import { PDSEducationElementaryService } from './parts/education/pds-education-elementary/pds-education-elementary.service';
import { PDSEducationGraduateService } from './parts/education/pds-education-graduate/pds-education-graduate.service';
import { PDSEducationSecondaryService } from './parts/education/pds-education-secondary/pds-education-secondary.service';
import { PDSEducationVocationalService } from './parts/education/pds-education-vocational/pds-education-vocational.service';
import { PDSEligibilityService } from './parts/eligibility/pds-eligibility.service';
import { PDSFamilyChildrenService } from './parts/family-background/pds-family-children/pds-family-children.service';
import { PDSFamilyParentsService } from './parts/family-background/pds-family-parents/pds-family-parents.service';
import { PDSFamilySpouseService } from './parts/family-background/pds-family-spouse/pds-family-spouse.service';
import { PDSLearningDevelopmentService } from './parts/learning-development/pds-learning-development.service';
import { PDSCandidateResignedService } from './parts/other-information/c4-questions/candidate-resigned/pds-candidate-resigned.service';
import { PDSConvictedService } from './parts/other-information/c4-questions/convicted/pds-convicted.service';
import { PDSGovernmentIssuedIdService } from './parts/other-information/c4-questions/government-issued-id/pds-government-issued-id.service';
import { PDSGuiltyChargedService } from './parts/other-information/c4-questions/guilty-charged/pds-guilty-charged.service';
import { PDSImmigrantService } from './parts/other-information/c4-questions/immigrant/pds-immigrant.service';
import { PDSIndigenousPWDSoloParentService } from './parts/other-information/c4-questions/indigenous-pwd-soloparent/pds-indigenous-pwd-soloparent.service';
import { PDSOfficeRelationService } from './parts/other-information/c4-questions/office-relation/pds-office-relation.service';
import { PDSReferencesService } from './parts/other-information/c4-questions/references/pds-references.service';
import { PDSSeparatedServiceService } from './parts/other-information/c4-questions/separated-service/pds-separated-service.service';
import { PDSOrganizationService } from './parts/other-information/organization/pds-organization.service';
import { PDSRecognitionService } from './parts/other-information/recognition/pds-recognition.service';
import { PDSSkillsService } from './parts/other-information/skills/pds-skills.service';
import { PDSVoluntaryWorkService } from './parts/voluntary-work/pds-voluntary-work.service';
import { PDSWorkExperienceService } from './parts/work-experience/pds-workexperience.service';
import { PDSBasicGovernmentAgenciesIds } from './parts/basic-info/pds-basic-government-agencies-ids/data/entities/pds-basic-government-agencies-id.entity';
import { PDSGovernmentIssuedId } from './parts/other-information/c4-questions/government-issued-id/data/entities/pds-government-issued-id.entity';
import { WorkExperienceSheetService } from './parts/work-experience-sheet/work-experience-sheet.service';

@Injectable()
export class PDSService {
  constructor(
    //#region  services
    private pdsBasicPersonalInfoService: PDSBasicPersonalInfoService,
    private pdsBasicGovernmentIssuedIdsService: PDSBasicGovernmentAgenciesIdsService,
    private pdsBasicResidentialAddressService: PDSBasicResidentialAddressService,
    private pdsBasicPermanentAddressService: PDSBasicPermanentAddressService,
    private pdsFamilySpouseService: PDSFamilySpouseService,
    private pdsFamilyParentsService: PDSFamilyParentsService,
    private pdsFamilyChildrenService: PDSFamilyChildrenService,
    private pdsEducationElementaryService: PDSEducationElementaryService,
    private pdsEducationSecondaryService: PDSEducationSecondaryService,
    private pdsEducationVocationalService: PDSEducationVocationalService,
    private pdsEducationCollegeService: PDSEducationCollegeService,
    private pdsEducationGraduateService: PDSEducationGraduateService,
    private pdsEligibilityService: PDSEligibilityService,
    private pdsWorkExperienceService: PDSWorkExperienceService,
    private pdsLearningDevelopmentService: PDSLearningDevelopmentService,
    private pdsVoluntaryWorkService: PDSVoluntaryWorkService,
    private pdsSkillsService: PDSSkillsService,
    private pdsRecognitionService: PDSRecognitionService,
    private pdsOrganizationService: PDSOrganizationService,
    private pdsOfficeRelationService: PDSOfficeRelationService,
    private pdsGuiltyChargedService: PDSGuiltyChargedService,
    private pdsConvictedService: PDSConvictedService,
    private pdsSeparatedServiceService: PDSSeparatedServiceService,
    private pdsCandidateResignedService: PDSCandidateResignedService,
    private pdsImmigrantService: PDSImmigrantService,
    private pdsIndigenousPWDSoloParentService: PDSIndigenousPWDSoloParentService,
    private pdsReferencesService: PDSReferencesService,
    private pdsGovernmentIssuedIdService: PDSGovernmentIssuedIdService,
    private workExperienceSheetService: WorkExperienceSheetService, //#endregion services
  ) {}

  async updatePDS(externalApplicantId: string, pdsDTO: PdsDTOUpdate) {
    try {
      await getManager().transaction(async (transactionEntityManager) => {
        //#region Basic
        console.log('plakkkkkk ');
        console.log(pdsDTO);
        const { email, firstName, lastName, middleName, mobileNumber, nameExtension, ...restPersonal } = pdsDTO.personalInfo;
        const { brgyCode, cityCode, provCode, ...restPermanentAddress } = pdsDTO.permanentAddress;

        await transactionEntityManager.getRepository(PDSBasicPersonalInfo).createQueryBuilder().update().set(restPersonal).where({ externalApplicantId }).execute();
        await transactionEntityManager.getRepository(PDSBasicPermanentAddress).createQueryBuilder().update().set(restPermanentAddress).where({ externalApplicantId }).execute();
        await transactionEntityManager
          .getRepository(PDSBasicResidentialAddress)
          .createQueryBuilder()
          .update()
          .set({
            barangay: pdsDTO.residentialAddress.barangay,
            city: pdsDTO.residentialAddress.city,
            houseNumber: pdsDTO.residentialAddress.houseNumber,
            province: pdsDTO.residentialAddress.province,
            street: pdsDTO.residentialAddress.street,
            subdivision: pdsDTO.residentialAddress.subdivision,
            zipCode: pdsDTO.residentialAddress.zipCode,
          })
          .where({ externalApplicantId })
          .execute();
        await transactionEntityManager
          .getRepository(PDSBasicGovernmentAgenciesIds)
          .createQueryBuilder()
          .update()
          .set(pdsDTO.governmentIssuedIds)
          .where({ externalApplicantId })
          .execute();
        //#endregion

        console.log('plakkkkkk 2');
        //#region Family
        await transactionEntityManager.getRepository(PDSFamilySpouse).createQueryBuilder().update().set(pdsDTO.spouse).where({ externalApplicantId }).execute();
        await transactionEntityManager.getRepository(PDSFamilyParents).createQueryBuilder().update().set(pdsDTO.parents).where({ externalApplicantId }).execute();
        await this.pdsFamilyChildrenService.updateChildrenTransaction(transactionEntityManager, pdsDTO.children, externalApplicantId);
        //#endregion

        //#region Education
        const { degree, ...restElementary } = pdsDTO.elementary;
        await transactionEntityManager.getRepository(PDSEducationElementary).createQueryBuilder().update().set(restElementary).where({ externalApplicantId }).execute();
        await this.pdsEducationSecondaryService.updateSecondaryTransaction(transactionEntityManager, pdsDTO.secondary, externalApplicantId);
        await transactionEntityManager.getRepository(PDSEducationSecondary).createQueryBuilder().update().set(pdsDTO.secondary).where({ externalApplicantId }).execute();
        await this.pdsEducationCollegeService.updateCollegeTransaction(transactionEntityManager, pdsDTO.college, externalApplicantId);
        await this.pdsEducationVocationalService.updateVocationalTransaction(transactionEntityManager, pdsDTO.vocational, externalApplicantId);
        await this.pdsEducationGraduateService.updateGraduateTransaction(transactionEntityManager, pdsDTO.graduate, externalApplicantId);
        //#endregion

        //#region Eligibility

        await this.pdsEligibilityService.updateEligibilityTransaction(transactionEntityManager, pdsDTO.eligibility, externalApplicantId);

        //#endregion Eligibility

        //#region Work Experience
        await this.pdsWorkExperienceService.updateWorkExperienceTransaction(transactionEntityManager, pdsDTO.workExperience, externalApplicantId);
        //#endregion

        //#region Learning And Development
        await this.pdsLearningDevelopmentService.updateLearningDevelopmentTransaction(transactionEntityManager, pdsDTO.learningDevelopment, externalApplicantId);
        //#endregion

        //#region VoluntaryWork
        await this.pdsVoluntaryWorkService.updateVoluntaryWorkTransaction(transactionEntityManager, pdsDTO.voluntaryWork, externalApplicantId);
        //#endregion

        //#region Skill
        await this.pdsSkillsService.updateSkillsTransaction(transactionEntityManager, pdsDTO.skills, externalApplicantId);
        //#endregion

        //#region Recognitions
        await this.pdsRecognitionService.updateRecognitionTransaction(transactionEntityManager, pdsDTO.recognitions, externalApplicantId);
        //#endregion

        //#region Organizations
        await this.pdsOrganizationService.updateOrganizationTransaction(transactionEntityManager, pdsDTO.organizations, externalApplicantId);
        //#endregion

        //#region Reference
        await this.pdsReferencesService.updateReferencesTransaction(transactionEntityManager, pdsDTO.references, externalApplicantId);
        //#endregion

        //#region Government Issued Id
        await transactionEntityManager
          .getRepository(PDSGovernmentIssuedId)
          .createQueryBuilder()
          .update()
          .set(pdsDTO.governmentIssuedId)
          .where({ externalApplicantId: pdsDTO.governmentIssuedId.externalApplicantId })
          .execute();
        //#endregion
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('An error has occured', 500);
    }
  }
  async savePDS(externalApplicantId: string, pdsDTO: PdsDTO) {
    let personalInfo = {};
    const children = [];
    let governmentIssuedIds = {};
    let permanentAddress = {};
    let address = {};
    let parents = {};
    let familyBackground = {};
    let education = {};
    const eligibility = [];
    const workExperience = [];
    const learningDevelopment = [];
    const voluntaryWork = [];
    let otherInformation = {};

    try {
      await getManager().transaction(async (transactionEntityManager) => {
        personalInfo = await transactionEntityManager.save(this.pdsBasicPersonalInfoService.createEntity({ externalApplicantId, ...pdsDTO.personalInfo }));
        governmentIssuedIds = await transactionEntityManager.save(this.pdsBasicGovernmentIssuedIdsService.createEntity({ externalApplicantId, ...pdsDTO.governmentIssuedIds }));
        permanentAddress = await transactionEntityManager.save(this.pdsBasicPermanentAddressService.createEntity({ externalApplicantId, ...pdsDTO.permanentAddress }));

        let residentialAddress = {};
        if (pdsDTO.residentialAddress) {
          residentialAddress = await transactionEntityManager.save(this.pdsBasicResidentialAddressService.createEntity({ externalApplicantId, ...pdsDTO.residentialAddress }));
        }

        let spouse = {};
        if (pdsDTO.spouse) {
          spouse = await transactionEntityManager.save(this.pdsFamilySpouseService.createEntity({ externalApplicantId, ...pdsDTO.spouse }));
        }
        await Promise.all(
          pdsDTO.children.map(async (child) => {
            children.push(await transactionEntityManager.save(this.pdsFamilyChildrenService.createEntity({ externalApplicantId, ...child })));
          }),
        );
        parents = await transactionEntityManager.save(this.pdsFamilyParentsService.createEntity({ externalApplicantId, ...pdsDTO.parents }));
        address = { permanentAddress, residentialAddress };
        familyBackground = { spouse, parents, children };

        let elementary = {};
        if (pdsDTO.elementary && pdsDTO.elementary !== null)
          elementary = await transactionEntityManager.save(this.pdsEducationElementaryService.createEntity({ externalApplicantId, ...pdsDTO.elementary }));

        let secondary = {};
        if (pdsDTO.secondary && pdsDTO.secondary !== null) {
          if (pdsDTO.secondary.schoolName !== '')
            secondary = await transactionEntityManager.save(this.pdsEducationSecondaryService.createEntity({ externalApplicantId, ...pdsDTO.secondary }));
        }

        const vocational = [];

        if (pdsDTO.vocational) {
          await Promise.all(
            pdsDTO.vocational.map(async (vocationalItem) => {
              const { _id, ...rest } = vocationalItem;
              vocational.push(await transactionEntityManager.save(this.pdsEducationVocationalService.createEntity({ externalApplicantId, ...rest })));
            }),
          );
        }

        const college = [];

        if (pdsDTO.college) {
          await Promise.all(
            pdsDTO.college.map(async (collegeItem) => {
              const { _id, ...rest } = collegeItem;
              college.push(await transactionEntityManager.save(this.pdsEducationCollegeService.createEntity({ externalApplicantId, ...rest })));
            }),
          );
        }

        const graduate = [];

        if (pdsDTO.graduate) {
          await Promise.all(
            pdsDTO.graduate.map(async (graduateItem) => {
              const { _id, ...rest } = graduateItem;
              graduate.push(await transactionEntityManager.save(this.pdsEducationGraduateService.createEntity({ externalApplicantId, ...rest })));
            }),
          );
        }

        education = { elementary, secondary, vocational, college, graduate };

        if (pdsDTO.eligibility) {
          await Promise.all(
            pdsDTO.eligibility.map(async (eligibilityItem) => {
              const { _id, examDateFrom, examDateTo, examDate, ...rest } = eligibilityItem;
              const { to, from } = examDate;
              let _examDate = '';
              if (to === null) _examDate = from;
              else _examDate = from + ' to ' + to;

              eligibility.push(await transactionEntityManager.save(this.pdsEligibilityService.createEntity({ externalApplicantId, ...rest, examDate: _examDate })));
            }),
          );
        }

        if (pdsDTO.workExperience) {
          await Promise.all(
            pdsDTO.workExperience.map(async (workExperienceItem) => {
              const { _id, ...rest } = workExperienceItem;
              workExperience.push(await transactionEntityManager.save(this.pdsWorkExperienceService.createEntity({ externalApplicantId, ...rest })));
            }),
          );
        }

        if (pdsDTO.voluntaryWork) {
          await Promise.all(
            pdsDTO.voluntaryWork.map(async (pdsVoluntaryWorkItem) => {
              const { _id, ...rest } = pdsVoluntaryWorkItem;
              voluntaryWork.push(await transactionEntityManager.save(this.pdsVoluntaryWorkService.createEntity({ externalApplicantId, ...rest })));
            }),
          );
        }

        if (pdsDTO.learningDevelopment) {
          await Promise.all(
            pdsDTO.learningDevelopment.map(async (learningDevelopmentItem) => {
              const { _id, ...rest } = learningDevelopmentItem;
              learningDevelopment.push(await transactionEntityManager.save(this.pdsLearningDevelopmentService.createEntity({ externalApplicantId, ...rest })));
            }),
          );
        }

        const skills = [];
        if (pdsDTO.skills) {
          await Promise.all(
            pdsDTO.skills.map(async (skillItem) => {
              const { skill } = skillItem;
              skills.push(await transactionEntityManager.save(this.pdsSkillsService.createEntity({ externalApplicantId, skill })));
            }),
          );
        }

        const recognitions = [];
        if (pdsDTO.recognitions) {
          await Promise.all(
            pdsDTO.recognitions.map(async (recognitionItem) => {
              const { recognition } = recognitionItem;
              recognitions.push(await transactionEntityManager.save(this.pdsRecognitionService.createEntity({ externalApplicantId, recognition })));
            }),
          );
        }

        const organizations = [];
        if (pdsDTO.organizations) {
          await Promise.all(
            pdsDTO.organizations.map(async (organizationItem) => {
              const { organization } = organizationItem;
              organizations.push(await transactionEntityManager.save(this.pdsOrganizationService.createEntity({ externalApplicantId, organization })));
            }),
          );
        }

        const officeRelation = await transactionEntityManager.save(this.pdsOfficeRelationService.createEntity({ externalApplicantId, ...pdsDTO.officeRelation }));
        const guiltyCharged = await transactionEntityManager.save(this.pdsGuiltyChargedService.createEntity({ externalApplicantId, ...pdsDTO.guiltyCharged }));
        const convicted = await transactionEntityManager.save(this.pdsConvictedService.createEntity({ externalApplicantId, ...pdsDTO.convicted }));
        const separatedService = await transactionEntityManager.save(this.pdsSeparatedServiceService.createEntity({ externalApplicantId, ...pdsDTO.separatedService }));
        const candidateResigned = await transactionEntityManager.save(this.pdsCandidateResignedService.createEntity({ externalApplicantId, ...pdsDTO.candidateResigned }));
        const immigrant = await transactionEntityManager.save(this.pdsImmigrantService.createEntity({ externalApplicantId, ...pdsDTO.immigrant }));
        const indigenousPwdSoloParent = await transactionEntityManager.save(
          this.pdsIndigenousPWDSoloParentService.createEntity({ externalApplicantId, ...pdsDTO.indigenousPwdSoloParent }),
        );

        const references = [];
        if (pdsDTO.references) {
          await Promise.all(
            pdsDTO.references.map(async (reference) => {
              const { _id, ...rest } = reference;
              references.push(await transactionEntityManager.save(this.pdsReferencesService.createEntity({ externalApplicantId, ...rest })));
            }),
          );
        }
        const governmentIssuedId = await transactionEntityManager.save(this.pdsGovernmentIssuedIdService.createEntity({ externalApplicantId, ...pdsDTO.governmentIssuedId }));

        otherInformation = {
          skills,
          recognitions,
          organizations,
          officeRelation,
          guiltyCharged,
          convicted,
          separatedService,
          candidateResigned,
          immigrant,
          indigenousPwdSoloParent,
          references,
          governmentIssuedId,
        };
      });
      return {
        personalInfo,
        address,
        governmentIssuedIds,
        familyBackground,
        ...education,
        eligibility,
        workExperience,
        voluntaryWork,
        learningDevelopment,
        ...otherInformation,
      };
    } catch (error) {
      console.log(error.message);
      throw new HttpException('Error saving PDS.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkExistingApplicantPDS(externalApplicantId: string) {
    const applicantExists = await this.pdsBasicPersonalInfoService.entityRepository.findOne({ where: { externalApplicantId } });
    let isExists = false;
    if (applicantExists) isExists = true;
    return {
      isExists,
      externalApplicantId,
    };
  }

  async getApplicantPdsWithWorkExperience(applicantId: string) {
    const externalApplicantId = (
      await this.pdsBasicPersonalInfoService.entityRepository.query(`SELECT external_applicant_id_fk externalApplicantId FROM posting_applicants WHERE _id = ?`, [applicantId])
    )[0].externalApplicantId;
    console.log(externalApplicantId);
    const pds = await this.getPDSEmp(externalApplicantId);
    const workExperienceSheet = await this.workExperienceSheetService.getWorkExperienceSheet(applicantId);
    return { ...pds, workExperienceSheet };
  }

  async getPDSEmp(externalApplicantId: string) {
    const applicantInfo = await this.pdsBasicPersonalInfoService.entityRepository
      .createQueryBuilder('pbpi')
      .select('ea.first_name', 'firstName')
      .addSelect('ea.middle_name', 'middleName')
      .addSelect('ea.last_name', 'lastName')
      .addSelect('ea.name_extension', 'nameExtension')
      .addSelect('ea.email', 'email')
      .where('ea._id = :externalApplicantId', { externalApplicantId })
      .innerJoin('external_applicants', 'ea', 'ea._id = pbpi.external_applicant_id_fk')
      .getRawOne();

    if (!applicantInfo) {
      throw new HttpException('Applicant not found.', 404);
    }

    const personalInfo = await this.pdsBasicPersonalInfoService.entityRepository.findOne({
      select: ['birthDate', 'birthPlace', 'sex', 'civilStatus', 'height', 'weight', 'bloodType', 'mobileNumber', 'telephoneNumber', 'citizenship', 'citizenshipType', 'country'],
      where: { externalApplicantId },
    });

    const permanentAddress = await this.pdsBasicPermanentAddressService.entityRepository.findOne({
      select: ['houseNumber', 'street', 'subdivision', 'barangay', 'city', 'province', 'zipCode'],
      where: { externalApplicantId },
    });

    const residentialAddress = await this.pdsBasicResidentialAddressService.entityRepository.findOne({
      select: ['houseNumber', 'street', 'subdivision', 'barangay', 'city', 'province', 'zipCode'],
      where: { externalApplicantId },
    });

    const governmentIssuedIds = await this.pdsBasicGovernmentIssuedIdsService.entityRepository.findOne({
      select: ['agencyNumber', 'gsisNumber', 'pagibigNumber', 'philhealthNumber', 'sssNumber', 'tinNumber'],
      where: { externalApplicantId },
    });

    const address = { permanentAddress, residentialAddress };

    const basicInfo = { personalInfo: { ...applicantInfo, ...personalInfo }, address, governmentIssuedIds };

    const spouse = await this.pdsFamilySpouseService.entityRepository.findOne({
      select: ['firstName', 'middleName', 'lastName', 'nameExtension', 'occupation', 'employer', 'businessAddress', 'telephoneNumber'],
      where: { externalApplicantId },
    });

    const mother = await this.pdsFamilyParentsService.entityRepository
      .createQueryBuilder('p')
      .select('mother_maiden_name', 'motherMaidenName')
      .addSelect('mother_first_name', 'motherFirstName')
      .addSelect('mother_middle_name', 'motherMiddleName')
      .addSelect('mother_last_name', 'motherLastName')
      .where('external_applicant_id_fk=:externalApplicantId', { externalApplicantId })
      .getRawOne();

    const father = await this.pdsFamilyParentsService.entityRepository
      .createQueryBuilder('p')
      .select('father_first_name', 'fatherFirstName')
      .addSelect('father_middle_name', 'fatherMiddleName')
      .addSelect('father_last_name', 'fatherLastName')
      .addSelect('father_name_extension', 'fatherNameExtension')
      .where('external_applicant_id_fk=:externalApplicantId', { externalApplicantId })
      .getRawOne();

    const parents = { ...mother, ...father };

    // const children = await this.pdsFamilyChildrenService.entityRepository.find({
    //   select: ['childName', 'birthDate'],
    //   where: { externalApplicantId },
    // });

    const children = await this.pdsFamilyChildrenService.entityRepository.query(
      `
        SELECT child_name childName, DATE_FORMAT(birth_date, '%Y-%m-%d') birthDate FROM pds_family_children WHERE external_applicant_id_fk = ? ORDER BY birth_date DESC;
    `,
      [externalApplicantId],
    );

    const family = { spouse, parents, children };

    const _elementary = await this.pdsEducationElementaryService.entityRepository.findOne({
      select: ['schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards'],
      where: { externalApplicantId },
    });

    let elementary: any = { schoolName: null, from: null, to: null, yearGraduated: null, units: null, awards: null };
    if (_elementary) elementary = { ..._elementary, degree: 'Primary Education' };

    const _secondary = await this.pdsEducationSecondaryService.entityRepository.findOne({
      select: ['schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
      where: { externalApplicantId },
    });

    let secondary: any = { schoolName: null, from: null, to: null, yearGraduated: null, units: null, awards: null, degree: null };
    if (_secondary) secondary = { ..._secondary };

    // const vocational = await this.pdsEducationVocationalService.entityRepository.find({
    //   select: ['_id', 'schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
    //   where: { externalApplicantId },
    // });

    const vocational = await this.pdsEducationVocationalService.entityRepository.query(
      `
          SELECT _id, school_name schoolName, \`from\`, \`to\`, year_graduated yearGraduated, units, awards, degree FROM pds_education_vocational WHERE external_applicant_id_fk=? ORDER BY \`from\` DESC;
    `,
      [externalApplicantId],
    );

    // const college = await this.pdsEducationCollegeService.entityRepository.find({
    //   select: ['_id', 'schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
    //   where: { externalApplicantId },
    // });

    const college = await this.pdsEducationCollegeService.entityRepository.query(
      `
    SELECT _id, school_name schoolName, \`from\`, \`to\`, year_graduated yearGraduated, units, awards, degree FROM pds_education_college WHERE external_applicant_id_fk=? ORDER BY \`from\` DESC;
`,
      [externalApplicantId],
    );

    // const graduate = await this.pdsEducationGraduateService.entityRepository.find({
    //   select: ['_id', 'schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
    //   where: { externalApplicantId },
    // });

    const graduate = await this.pdsEducationCollegeService.entityRepository.query(
      `
    SELECT _id, school_name schoolName, \`from\`, \`to\`, year_graduated yearGraduated, units, awards, degree FROM pds_education_graduate WHERE external_applicant_id_fk=? ORDER BY \`from\` DESC;
`,
      [externalApplicantId],
    );

    const education = { elementary, secondary, vocational, college, graduate };

    const _eligibility = await this.pdsEligibilityService.entityRepository.find({
      select: ['_id', 'name', 'rating', 'examDate', 'examPlace', 'validity', 'licenseNumber'],
      where: { externalApplicantId },
      order: { examDate: 'DESC' },
    });

    const eligibility = await Promise.all(
      _eligibility.map(async (eligibilityItem) => {
        const { examDate, ...rest } = eligibilityItem;
        const examDateFromTo = examDate.split(' to ');
        if (examDateFromTo.length === 2) return { ...rest, examDate: { from: examDateFromTo[0], to: examDateFromTo[1] } };
        return { ...rest, examDate: { from: examDateFromTo[0], to: null } };
      }),
    );

    // const workExperience = await this.pdsWorkExperienceService.entityRepository.find({
    //   select: ['_id', 'positionTitle', 'companyName', 'from', 'to', 'monthlySalary', 'salaryGrade', 'appointmentStatus', 'isGovernmentService'],
    //   where: { externalApplicantId },
    // });

    const workExperience = await this.pdsWorkExperienceService.entityRepository.query(
      `SELECT 
        _id, 
        position_title positionTitle, 
        company_name companyName, 
        DATE_FORMAT(\`from\`,'%Y-%m-%d') \`from\`,
        DATE_FORMAT(\`to\` ,'%Y-%m-%d') \`to\` ,
        is_government_service isGovernmentService,
        appointment_status appointmentStatus,
        salary_grade salaryGrade,
        monthly_salary monthlySalary
      FROM pds_work_experience 
      WHERE external_applicant_id_fk = ? 
      ORDER BY \`from\` DESC;`,
      [externalApplicantId],
    );

    // const voluntaryWork = await this.pdsVoluntaryWorkService.entityRepository.find({
    //   select: ['_id', 'position', 'organizationName', 'from', 'to', 'numberOfHours'],
    //   where: { externalApplicantId },
    // });

    const voluntaryWork = await this.pdsVoluntaryWorkService.entityRepository.query(
      `
        SELECT 
        _id, 
        position,
        organization_name organizationName, 
        number_of_hours numberOfHours,
        DATE_FORMAT(\`from\`,'%Y-%m-%d') \`from\`,
        DATE_FORMAT(\`to\` ,'%Y-%m-%d') \`to\` 
        FROM pds_voluntary_work WHERE external_applicant_id_fk =? 
        ORDER BY \`from\` DESC;`,
      [externalApplicantId],
    );

    // const learningDevelopment = await this.pdsLearningDevelopmentService.entityRepository.find({
    //   select: ['_id', 'title', 'from', 'to', 'numberOfHours', 'type', 'conductedBy'],
    //   where: { externalApplicantId },
    //   order: { from: 'DESC' },
    // });
    const learningDevelopment = await this.pdsLearningDevelopmentService.entityRepository.query(
      `
        SELECT _id,
        title,
        conducted_by conductedBy,
        number_of_hours numberOfHours,
        DATE_FORMAT(\`from\`,'%Y-%m-%d') \`from\`,
        DATE_FORMAT(\`to\` ,'%Y-%m-%d') \`to\`,
        \`type\`
        FROM pds_learning_development WHERE external_applicant_id_fk =? 
        ORDER BY \`from\` DESC;`,
      [externalApplicantId],
    );

    const skills = await this.pdsSkillsService.entityRepository.find({
      select: ['_id', 'skill'],
      where: { externalApplicantId },
    });

    const recognitions = await this.pdsRecognitionService.entityRepository.find({
      select: ['_id', 'recognition'],
      where: { externalApplicantId },
    });

    const organizations = await this.pdsOrganizationService.entityRepository.find({
      select: ['_id', 'organization'],
      where: { externalApplicantId },
    });

    const officeRelation = await this.pdsOfficeRelationService.entityRepository.findOne({
      select: ['withinThirdDegree', 'withinFourthDegree', 'details'],
      where: { externalApplicantId },
    });

    const guiltyCharged = await this.pdsGuiltyChargedService.entityRepository.findOne({
      select: ['isGuilty', 'guiltyDetails', 'isCharged', 'chargedCaseStatus', 'chargedDateFiled'],
      where: { externalApplicantId },
    });

    const convicted = await this.pdsConvictedService.entityRepository.findOne({
      select: ['isConvicted', 'details'],
    });

    const separatedService = await this.pdsSeparatedServiceService.entityRepository.findOne({
      select: ['isSeparated', 'details'],
      where: { externalApplicantId },
    });

    const candidateResigned = await this.pdsCandidateResignedService.entityRepository.findOne({
      select: ['isCandidate', 'candidateDetails', 'isResigned', 'resignedDetails'],
      where: { externalApplicantId },
    });

    const immigrant = await this.pdsImmigrantService.entityRepository.findOne({
      select: ['isImmigrant', 'details'],
      where: { externalApplicantId },
    });

    const indigenousPwdSoloParent = await this.pdsIndigenousPWDSoloParentService.entityRepository.findOne({
      select: ['isIndigenousMember', 'indigenousMemberDetails', 'isPwd', 'pwdIdNumber', 'isSoloParent', 'soloParentIdNumber'],
      where: { externalApplicantId },
    });

    const references = await this.pdsReferencesService.entityRepository.find({
      select: ['_id', 'name', 'address', 'telephoneNumber'],
      where: { externalApplicantId },
    });

    const governmentIssuedId = await this.pdsGovernmentIssuedIdService.entityRepository.findOne({
      select: ['issuedId', 'idNumber', 'issueDate', 'issuePlace'],
      where: { externalApplicantId },
    });

    const supportingDetails = { officeRelation, guiltyCharged, convicted, separatedService, candidateResigned, immigrant, indigenousPwdSoloParent };
    const otherInfo = { skills, recognitions, organizations, supportingDetails, references, governmentIssuedId };

    return {
      personalInfo: { ...applicantInfo, ...personalInfo },
      permanentAddress,
      residentialAddress,
      governmentIssuedIds,
      spouse,
      parents,
      children,
      elementary,
      secondary,
      vocational,
      college,
      graduate,
      eligibility,
      workExperience,
      voluntaryWork,
      learningDevelopment,
      skills,
      recognitions,
      organizations,
      officeRelation,
      guiltyCharged,
      convicted,
      separatedService,
      candidateResigned,
      immigrant,
      indigenousPwdSoloParent,
      references,
      governmentIssuedId,
    };
  }

  async getPDS(externalApplicantId: string) {
    const applicantInfo = await this.pdsBasicPersonalInfoService.entityRepository
      .createQueryBuilder('pbpi')
      .select('ea.first_name', 'firstName')
      .addSelect('ea.middle_name', 'middleName')
      .addSelect('ea.last_name', 'lastName')
      .addSelect('ea.name_extension', 'nameExtension')
      .addSelect('ea.email', 'email')
      .where('ea._id = :externalApplicantId', { externalApplicantId })
      .innerJoin('external_applicants', 'ea', 'ea._id = pbpi.external_applicant_id_fk')
      .getRawOne();

    if (!applicantInfo) {
      throw new HttpException('Applicant not found.', 404);
    }

    const personalInfo = await this.pdsBasicPersonalInfoService.entityRepository.findOne({
      select: ['birthDate', 'birthPlace', 'sex', 'civilStatus', 'height', 'weight', 'bloodType', 'mobileNumber', 'telephoneNumber', 'citizenship', 'citizenshipType', 'country'],
      where: { externalApplicantId },
    });

    const permanentAddress = await this.pdsBasicPermanentAddressService.entityRepository.findOne({
      select: ['houseNumber', 'street', 'subdivision', 'barangay', 'city', 'province', 'zipCode'],
      where: { externalApplicantId },
    });

    const residentialAddress = await this.pdsBasicResidentialAddressService.entityRepository.findOne({
      select: ['houseNumber', 'street', 'subdivision', 'barangay', 'city', 'province', 'zipCode'],
      where: { externalApplicantId },
    });

    const governmentIssuedIds = await this.pdsBasicGovernmentIssuedIdsService.entityRepository.findOne({
      select: ['agencyNumber', 'gsisNumber', 'pagibigNumber', 'philhealthNumber', 'sssNumber', 'tinNumber'],
      where: { externalApplicantId },
    });

    const address = { permanentAddress, residentialAddress };

    const basicInfo = { personalInfo: { ...applicantInfo, ...personalInfo }, address, governmentIssuedIds };

    const spouse = await this.pdsFamilySpouseService.entityRepository.findOne({
      select: ['firstName', 'middleName', 'lastName', 'nameExtension', 'occupation', 'employer', 'businessAddress', 'telephoneNumber'],
      where: { externalApplicantId },
    });

    const mother = await this.pdsFamilyParentsService.entityRepository
      .createQueryBuilder('p')
      .select('mother_maiden_name', 'maidenName')
      .addSelect('mother_first_name', 'firstName')
      .addSelect('mother_middle_name', 'middleName')
      .addSelect('mother_last_name', 'lastName')
      .where('external_applicant_id_fk=:externalApplicantId', { externalApplicantId })
      .getRawOne();

    const father = await this.pdsFamilyParentsService.entityRepository
      .createQueryBuilder('p')
      .select('father_first_name', 'firstName')
      .addSelect('father_middle_name', 'middleName')
      .addSelect('father_last_name', 'lastName')
      .addSelect('father_name_extension', 'nameExtension')
      .where('external_applicant_id_fk=:externalApplicantId', { externalApplicantId })
      .getRawOne();

    const parents = { ...mother, ...father };

    const children = await this.pdsFamilyChildrenService.entityRepository.find({
      select: ['childName', 'birthDate'],
      where: { externalApplicantId },
    });

    const family = { spouse, parents, children };

    const _elementary = await this.pdsEducationElementaryService.entityRepository.findOne({
      select: ['schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards'],
      where: { externalApplicantId },
    });

    let elementary: any = { schoolName: null, from: null, to: null, yearGraduated: null, units: null, awards: null };
    if (_elementary) elementary = { ..._elementary, degree: 'Primary Education' };

    const _secondary = await this.pdsEducationSecondaryService.entityRepository.findOne({
      select: ['schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
      where: { externalApplicantId },
    });

    let secondary: any = { schoolName: null, from: null, to: null, yearGraduated: null, units: null, awards: null, degree: null };
    if (_secondary) secondary = { ..._secondary };

    const vocational = await this.pdsEducationVocationalService.entityRepository.find({
      select: ['schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
      where: { externalApplicantId },
    });

    const college = await this.pdsEducationCollegeService.entityRepository.find({
      select: ['schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
      where: { externalApplicantId },
    });

    const graduate = await this.pdsEducationGraduateService.entityRepository.find({
      select: ['schoolName', 'from', 'to', 'yearGraduated', 'units', 'awards', 'degree'],
      where: { externalApplicantId },
    });

    const education = { elementary, secondary, vocational, college, graduate };

    const _eligibility = await this.pdsEligibilityService.entityRepository.find({
      select: ['name', 'rating', 'examDate', 'examPlace', 'validity', 'licenseNumber'],
      where: { externalApplicantId },
    });

    const eligibility = await Promise.all(
      _eligibility.map(async (eligibilityItem) => {
        const { examDate, ...rest } = eligibilityItem;
        const examDateFromTo = examDate.split(' to ');
        if (examDateFromTo.length === 2) return { ...rest, examDate: { from: examDateFromTo[0], to: examDateFromTo[1] } };
        return { ...rest, examDate: { from: examDateFromTo[0], to: null } };
      }),
    );

    const workExperience = await this.pdsWorkExperienceService.entityRepository.find({
      select: ['positionTitle', 'companyName', 'from', 'to', 'monthlySalary', 'salaryGrade', 'appointmentStatus', 'isGovernmentService'],
      where: { externalApplicantId },
    });

    const voluntaryWork = await this.pdsVoluntaryWorkService.entityRepository.find({
      select: ['_id', 'position', 'organizationName', 'from', 'to', 'numberOfHours'],
      where: { externalApplicantId },
    });

    const learningDevelopment = await this.pdsLearningDevelopmentService.entityRepository.find({
      select: ['title', 'from', 'to', 'numberOfHours', 'type', 'conductedBy'],
      where: { externalApplicantId },
    });

    const _skills = await this.pdsSkillsService.entityRepository.find({
      select: ['skill'],
      where: { externalApplicantId },
    });

    const skills = [];
    Promise.all(
      _skills.map(async (skill) => {
        skills.push(skill.skill);
      }),
    );

    const recognitions = [];
    const _recognitions = await this.pdsRecognitionService.entityRepository.find({
      select: ['recognition'],
      where: { externalApplicantId },
    });

    Promise.all(
      _recognitions.map(async (recognition) => {
        recognitions.push(recognition.recognition);
      }),
    );

    const organizations = [];
    const _organizations = await this.pdsOrganizationService.entityRepository.find({
      select: ['organization'],
      where: { externalApplicantId },
    });

    Promise.all(
      _organizations.map(async (organization) => {
        organizations.push(organization.organization);
      }),
    );

    const officeRelation = await this.pdsOfficeRelationService.entityRepository.findOne({
      select: ['withinThirdDegree', 'withinFourthDegree', 'details'],
      where: { externalApplicantId },
    });

    const guiltyCharged = await this.pdsGuiltyChargedService.entityRepository.findOne({
      select: ['isGuilty', 'guiltyDetails', 'isCharged', 'chargedCaseStatus', 'chargedDateFiled'],
      where: { externalApplicantId },
    });

    const convicted = await this.pdsConvictedService.entityRepository.findOne({
      select: ['isConvicted', 'details'],
    });

    const separatedService = await this.pdsSeparatedServiceService.entityRepository.findOne({
      select: ['isSeparated', 'details'],
      where: { externalApplicantId },
    });

    const candidateResigned = await this.pdsCandidateResignedService.entityRepository.findOne({
      select: ['isCandidate', 'candidateDetails', 'isResigned', 'resignedDetails'],
      where: { externalApplicantId },
    });

    const immigrant = await this.pdsImmigrantService.entityRepository.findOne({
      select: ['isImmigrant', 'details'],
      where: { externalApplicantId },
    });

    const indigenousPwdSoloParent = await this.pdsIndigenousPWDSoloParentService.entityRepository.findOne({
      select: ['isIndigenousMember', 'indigenousMemberDetails', 'isPwd', 'pwdIdNumber', 'isSoloParent', 'soloParentIdNumber'],
      where: { externalApplicantId },
    });

    const references = await this.pdsReferencesService.entityRepository.find({
      select: ['name', 'address', 'telephoneNumber'],
      where: { externalApplicantId },
    });

    const governmentIssuedId = await this.pdsGovernmentIssuedIdService.entityRepository.findOne({
      select: ['issuedId', 'idNumber', 'issueDate', 'issuePlace'],
      where: { externalApplicantId },
    });

    const supportingDetails = { officeRelation, guiltyCharged, convicted, separatedService, candidateResigned, immigrant, indigenousPwdSoloParent };
    const otherInfo = { skills, recognitions, organizations, supportingDetails, references, governmentIssuedId };
    return {
      basicInfo,
      family,
      education,
      eligibility,
      workExperience,
      voluntaryWork,
      learningDevelopment,
      otherInfo,
    };
  }
}
