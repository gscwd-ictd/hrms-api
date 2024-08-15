import { PostingStatus } from 'src/core/vacant-position-posting/utils/enums/posting-status.enum';
import { HiringProcessResultsService } from './data/views/hiring-process-results-view/hiring-process-results.service';
import { ApplicantEndorsementDTO } from './data/applicant-endorsement.dto';
import { ApplicantStatus } from './../applicants/utils/enums/applicant-status.enum';
import { PostingApplicantsDetailedViewService } from './../applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.service';
import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { BaseEntity, Repository } from 'typeorm';
import { ApplicantEndorsement } from './data/applicant-endorsement.entity';
import { ApplicantEndorsementStatus } from './utils/types/applicant-endorsement.enum';
import { getDateTimeNow } from 'src/global/utils/helper/date.helper';

@Injectable()
export class ApplicantEndorsementService extends BaseEntityCrudService<ApplicantEndorsement> {
  constructor(
    @InjectRepository(ApplicantEndorsement)
    private readonly applicantEndorsementRepository: Repository<ApplicantEndorsement>,
    private readonly postingApplicantsDetailedViewService: PostingApplicantsDetailedViewService,
    private readonly hiringProcessResultsService: HiringProcessResultsService,
  ) {
    super(applicantEndorsementRepository);
  }

  async getEndorsedApplicants(vppId: string) {
    try {
      const endorsedApplicants = await this.entityRepository.query(
        `SELECT padv.postingApplicantId postingApplicantId,
                padv.applicantName2 applicantName, 
                padv.applicantType applicantType
                    FROM posting_applicants_detailed_view padv 
                INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = padv.postingApplicantId
                WHERE padv.vppId = ? AND (ae.status = 'Endorsed' OR  ae.status = 'Selected by appointing authority' OR ae.status='Selected by requesting entity');`,
        [vppId],
      );
      return endorsedApplicants;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getAllQualifiedApplicants(vppId: string) {
    try {
      const allApplicants = await this.entityRepository.query(
        `
        SELECT padv.postingApplicantId postingApplicantId,
               padv.applicantId applicantId,
                padv.applicantName2 applicantName, 
                padv.applicantType applicantType
                    FROM posting_applicants_detailed_view padv 
                INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = padv.postingApplicantId
                WHERE padv.vppId = ?`,
        [vppId],
      );
      return allApplicants;
    } catch (error) {}
  }

  async getQualifiedApplicants(vppId: string) {
    try {
      const postingApplicants = await this.postingApplicantsDetailedViewService.entityRepository.query(
        `SELECT postingApplicantId, applicantName2 
      FROM posting_applicants_detailed_view WHERE vppId=? AND (applicantStatus = 'Qualified' OR applicantStatus = 'Shortlisted' OR applicantStatus = 'Accepted')`,
        [vppId],
      );

      const prfNo = (await this.entityRepository.query(`SELECT DISTINCT prfNo FROM vacant_position_posting_publication_view WHERE vppId=?`, [vppId]))[0].prfNo;

      const requestingEntity = (
        await this.entityRepository.query(
          `SELECT get_employee_fullname2(employee_id_fk) fullName, get_employee_position(employee_id_fk) position 
      FROM prf_details WHERE prf_no=?`,
          [prfNo],
        )
      )[0];

      return {
        requestingEntity: {
          name: requestingEntity.fullName,
          position: requestingEntity.position,
        },
        postingApplicants,
      };
    } catch (error) {}
  }

  async addEndorsedApplicants(vppId: string) {
    try {
      //1. get qualified applicants
      const postingApplicantsIds = await this.postingApplicantsDetailedViewService.entityRepository.find({
        select: ['postingApplicantId'],
        where: { applicantStatus: ApplicantStatus.QUALIFIED, vppId },
      });

      //2. map qualified applicants
      const endorsedApplicants = await Promise.all(
        postingApplicantsIds.map(async (postingApplicantId) => {
          //3. insert to endorsement table
          return await this.saveEntity({ postingApplicantId: postingApplicantId.postingApplicantId });
        }),
      );

      //4. update status of vpp
      const postingUpdate = await this.entityRepository.query(`UPDATE vacant_position_posting SET posting_status='Requesting entity selection' WHERE _id=?`, [vppId]);

      return { endorsedApplicants, postingUpdate };
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async selectApplicants(vppId: string, applicantEndorsementDTO: ApplicantEndorsementDTO) {
    console.log(applicantEndorsementDTO);
    const requestingEntitySelection = await Promise.all(
      applicantEndorsementDTO.postingApplicantIds.map(async (selection) => {
        const updateResult = await this.updateEndorsementStatus(selection, ApplicantEndorsementStatus.SELECTED_BY_REQUESTING_ENTITY);

        if (updateResult.affected > 0) {
          const updateVpp = await this.entityRepository.query(`UPDATE vacant_position_posting SET posting_status = 'Requesting entity selection done' WHERE _id=?`, [vppId]);
          const name = await this.getApplicantName(selection);
          return { postingApplicantId: selection, ...name };
        }
      }),
    );
    return { requestingEntitySelection };
  }

  async getApplicantsByEndorsementStatus(vppId: string, status: ApplicantEndorsementStatus) {
    try {
      const selectedApplicants = await this.entityRepository
        .createQueryBuilder('ae')
        .select('ae._id', 'applicantEndorsementId')
        .addSelect('padv.applicantName2', 'applicantName')
        .addSelect('padv.postingApplicantId', 'postingApplicantId')
        .addSelect('padv.applicantStatus', 'applicantStatus')
        .addSelect('padv.applicantId', 'applicantId')
        .addSelect('padv.applicantType', 'applicantType')
        .addSelect('has_dbm_csc_form(padv.postingApplicantId)', 'hasDbmCsc')
        .innerJoin('posting_applicants_detailed_view', 'padv', 'padv.postingApplicantId = ae.posting_applicant_id_fk')
        .where(`ae.status = :status AND padv.vppId=:vppId`, { status, vppId })
        .getRawMany();
      return selectedApplicants;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 500);
    }
  }

  private async updateEndorsementStatus(postingApplicantId: string, status: ApplicantEndorsementStatus) {
    try {
      const dateTimeNow = getDateTimeNow();
      if (status === ApplicantEndorsementStatus.SELECTED_BY_REQUESTING_ENTITY)
        return await this.entityRepository.createQueryBuilder().update().set({ status, requestingEntitySelectionDate: dateTimeNow }).where({ postingApplicantId }).execute();
      else if (status === ApplicantEndorsementStatus.SELECTED_BY_APPOINTING_AUTHORITY)
        return await this.entityRepository.createQueryBuilder().update().set({ status, appointingAuthoritySelectionDate: dateTimeNow }).where({ postingApplicantId }).execute();
    } catch (error) {
      console.log(error);
    }
  }

  async appointingAuthoritySelection(vppId: string, applicantEndorsementDTO: ApplicantEndorsementDTO) {
    try {
      //constraints
      //1. number of positions from vppId provided..
      const appointingAuthoritySelectionList = await Promise.all(
        applicantEndorsementDTO.postingApplicantIds.map(async (selection) => {
          const updateResult = await this.updateEndorsementStatus(selection, ApplicantEndorsementStatus.SELECTED_BY_APPOINTING_AUTHORITY);
          if (updateResult.affected > 0) {
            const name = await this.getApplicantName(selection);
            return { postingApplicantId: selection, name };
          }
        }),
      );
      await this.entityRepository.query(
        `
      UPDATE vacant_position_posting 
      SET posting_status = 'Appointing authority selection done' 
      WHERE _id=?`,
        [vppId],
      );
      if (appointingAuthoritySelectionList.length > 0) return appointingAuthoritySelectionList;
      return [{ postingApplicantId: null, name: null }];
    } catch (error) {}
  }

  private async getApplicantName(postingApplicantId: string) {
    return (
      await this.entityRepository.query(
        `
    SELECT applicantName2 applicantName 
      FROM posting_applicants_detailed_view WHERE postingApplicantId = ?`,
        [postingApplicantId],
      )
    )[0].applicantName;
  }

  async getAllPublicationsUnderRequestingEntity(employeeId: string) {
    //
    try {
      return await this.entityRepository.query(
        ` 
        SELECT DISTINCT vppId, 
              itemNumber,
              positionTitle, 
              postingDate,
              numberOfPositions,
              salaryGradeLevel,
              salaryGrade,
              annualSalary,
              education,training, eligibility, experience, 
              placeOfAssignment,
              occupationName,
              prfNo,
              prfId,
              withExam,
              postingStatus,
              requesting_entity_has_selected(vppId) hasSelected 
              FROM vacant_position_posting_view vpppv 
                  INNER JOIN posting_applicants pa ON pa.vacant_position_posting_id_fk = vpppv.vppId
                  INNER JOIN vacant_position_posting vpp ON vpp._id = vpppv.vppId
                  INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = pa._id 
                  INNER JOIN prf_details prfd ON vpppv.prfId = prfd._id
              WHERE prfd.employee_id_fk=?;
    `,
        [employeeId],
      );
    } catch (error) {}
  }

  async getAllPublicationsUnderRequestingEntityByEndorsementStatus(employeeId: string, applicantEndorsementStatus: ApplicantEndorsementStatus, postingStatus: PostingStatus) {
    try {
      return await this.entityRepository.query(
        `
      SELECT DISTINCT 
      vppId,
      itemNumber,
      positionTitle, 
      postingDate,
      ae.requesting_entity_selection_date requestingEntitySelectionDate,
      numberOfPositions,
      salaryGradeLevel,
      salaryGrade,
      annualSalary,
      education,training, eligibility, experience, 
      placeOfAssignment,
      occupationName,
      prfNo,
      prfId,
      withExam,
      postingStatus
      FROM vacant_position_posting_view vpppv 
          INNER JOIN posting_applicants pa ON pa.vacant_position_posting_id_fk = vpppv.vppId
          INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = pa._id 
          INNER JOIN prf_details prfd ON vpppv.prfId = prfd._id
      WHERE prfd.employee_id_fk=? AND ae.status=? AND vpppv.postingStatus=?;
    `,
        [employeeId, applicantEndorsementStatus, postingStatus],
      );
    } catch (error) {}
  }

  async getAppointingAuthoritySelectionCount() {
    try {
      const result = (
        await this.entityRepository.query(`
      SELECT COUNT(DISTINCT vppId) appointingAuthoritySelectionCount 
          FROM vacant_position_posting_view vpppv 
        INNER JOIN posting_applicants pa ON pa.vacant_position_posting_id_fk = vpppv.vppId
        INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = pa._id 
        INNER JOIN prf_details prfd ON vpppv.prfId = prfd._id
      WHERE vpppv.postingStatus = 'Appointing authority selection';
      `)
      )[0].appointingAuthoritySelectionCount;
      console.log(result);
      return parseInt(result);
    } catch (error) {}
  }

  async getAllPublicationsUnderAppointingAuthority() {
    try {
      return await this.entityRepository.query(
        `
          SELECT DISTINCT 
          vppId,
          itemNumber,
          positionTitle, 
          postingDate,
          ae.appointing_authority_selection_date appointingAuthoritySelectionDate,
          numberOfPositions,
          salaryGradeLevel,   
          salaryGrade,
          annualSalary,
          education,training, eligibility, experience, 
          placeOfAssignment,
          occupationName,
          prfNo,
          prfId,
          withExam,
          postingStatus,
          appointing_authority_has_selected(ae.posting_applicant_id_fk) hasSelected 
          FROM vacant_position_posting_view vpppv 
              INNER JOIN posting_applicants pa ON pa.vacant_position_posting_id_fk = vpppv.vppId
              INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = pa._id 
              INNER JOIN prf_details prfd ON vpppv.prfId = prfd._id
          WHERE vpppv.postingStatus = 'Appointing authority selection';
    `,
      );
    } catch (error) {}
  }

  async getAllPublicationsUnderAppointingAuthorityByEndorsementStatus(applicantEndorsementStatus: ApplicantEndorsementStatus, postingStatus: PostingStatus) {
    try {
      return await this.entityRepository.query(
        `
          SELECT DISTINCT 
          vppId,
          itemNumber,
          positionTitle, 
          postingDate,
          DATE_FORMAT(ae.appointing_authority_selection_date,'%Y-%m-%d') appointingAuthoritySelectionDate,
          numberOfPositions,
          salaryGradeLevel,
          salaryGrade,
          annualSalary,
          education,training, eligibility, experience, 
          placeOfAssignment,
          occupationName,
          prfNo,
          prfId,
          withExam,
          postingStatus 
          FROM vacant_position_posting_view vpppv 
              INNER JOIN posting_applicants pa ON pa.vacant_position_posting_id_fk = vpppv.vppId
              INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = pa._id 
              INNER JOIN prf_details prfd ON vpppv.prfId = prfd._id
          WHERE ae.status = ? AND postingStatus = ?;

    `,
        [applicantEndorsementStatus, postingStatus],
      );
    } catch (error) {}
  }

  async getHiringProcessByEffectivityDate(effectivityDate: Date) {
    try {
      return await this.hiringProcessResultsService.entityRepository.query(
        `SELECT DISTINCT hprv.vppId vppId,  
         hprv.positionTitle positionTitle, 
         get_nature_of_appointment(substring_index(vppv.positionId,',',1)) natureOfAppointment, 
         hprv.assignedTo assignedTo,
         hprv.salaryGradeLevel salaryGradeLevel,
         IF( hprv.salaryGradeLevel >= 12, 2, 1 ) \`level\`, 
         GROUP_CONCAT(plantillaNumber SEPARATOR ', \n') plantillaNumber, selected, DATE_FORMAT(vpp.effectivity_date,'%Y-%m-%d') effectivityDate  
         FROM hiring_process_results_view hprv  
            INNER JOIN vacant_position_posting vpp ON vpp._id = vppId 
            INNER JOIN vacant_position_posting_view vppv ON vppv.vppId = hprv.vppId 
         WHERE  vpp.effectivity_date = DATE_FORMAT(?,'%Y-%m-%d')  
         GROUP BY hprv.vppId, 
         hprv.positionTitle, 
         hprv.assignedTo, 
         hprv.salaryGradeLevel, 
         hprv.postingDate, 
         hprv.psbDate, 
         hprv.selected,positionId;`,
        [effectivityDate],
      );
    } catch (error) {}
  }
  async getHiringProcessResults12MonthRange() {
    try {
      return await this.hiringProcessResultsService.entityRepository.query(
        `SELECT DISTINCT hprv.vppId vppId,  
        hprv.positionTitle positionTitle, 
        get_nature_of_appointment(substring_index(vppv.positionId,',',1)) natureOfAppointment, 
        hprv.assignedTo assignedTo,
        hprv.salaryGradeLevel salaryGradeLevel,
        IF( hprv.salaryGradeLevel >= 12, 2, 1 ) \`level\`, 
        GROUP_CONCAT(plantillaNumber SEPARATOR ', \n') plantillaNumber, selected, DATE_FORMAT(vpp.effectivity_date,'%Y-%m-%d') effectivityDate 
        FROM hiring_process_results_view hprv  
           INNER JOIN vacant_position_posting vpp ON vpp._id = vppId 
           INNER JOIN vacant_position_posting_view vppv ON vppv.vppId = hprv.vppId 
        WHERE  effectivity_date BETWEEN DATE_SUB(curdate(), INTERVAL 6 MONTH) AND DATE_ADD(curdate(), INTERVAL 6 MONTH) 
        GROUP BY hprv.vppId, 
        hprv.positionTitle, 
        hprv.assignedTo, 
        hprv.salaryGradeLevel, 
        hprv.postingDate, 
        hprv.psbDate, 
        hprv.selected,positionId;`,
      );
    } catch (error) {
      console.log('here');
    }
  }

  async getHiringProcessResults(effectivityDate?: Date) {
    try {
      console.log(effectivityDate);
      if (typeof effectivityDate === 'undefined') {
        return await this.getHiringProcessResults12MonthRange();
      } else {
        return await this.getHiringProcessByEffectivityDate(effectivityDate);
      }
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
