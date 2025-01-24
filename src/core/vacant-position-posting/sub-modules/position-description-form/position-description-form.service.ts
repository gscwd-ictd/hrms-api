import { ApplicantEndorsementStatus } from './../applicant-endorsement/utils/types/applicant-endorsement.enum';
import { OccupationalGroupDutiesResponsibilitiesService } from './../../../occupational-group-duties-responsibilities/occupational-group-duties-responsibilities.service';
import { PositionDescriptionFormDTO, UpdatePositionDescriptionFormDto } from './data/position-description-form.dto';
import { PositionDescriptionFormWorkingConditionService } from './parts/working-condition/working-condition.service';
import { PositionDescriptionFormExternalContactsService } from './parts/contacts/external/external-contacts.service';
import { PositionDescriptionFormInternalContactsService } from './parts/contacts/internal/internal-contacts.service';
import { PositionDescriptionFormBasicService } from './parts/basic/basic.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { getManager } from 'typeorm';
import { DutyType } from 'src/core/occupational-group-duties-responsibilities/utils/enums/duty-type.enum';
import { CertifiedList } from './utils/types/position-description-form.type';
import { PositionDescriptionFormBasic } from './parts/basic/data/position-description-form-basic.entity';
import { PositionDescriptionFormInternalContacts } from './parts/contacts/internal/data/internal-contacts.entity';
import { PositionDescriptionFormExternalContacts } from './parts/contacts/external/data/external-contacts.entity';
import { PositionDescriptionFormWorkingCondition } from './parts/working-condition/data/working-condition.entity';

@Injectable()
export class PositionDescriptionFormService {
  constructor(
    private readonly positionDescriptionFormBasic: PositionDescriptionFormBasicService,
    private readonly positionDescriptionFormInternalContacts: PositionDescriptionFormInternalContactsService,
    private readonly positionDescriptionFormExternalContacts: PositionDescriptionFormExternalContactsService,
    private readonly positionDescriptionFormWorkingConditionService: PositionDescriptionFormWorkingConditionService,
    private readonly occupationalGroupDutiesResponsibilities: OccupationalGroupDutiesResponsibilitiesService,
  ) { }

  async savePositionDescriptionForm(positionDescriptionFormDTO: PositionDescriptionFormDTO) {
    try {
      const result = await getManager().transaction(async (transactionEntityManager) => {
        const {
          basic: { postingApplicantId },
        } = positionDescriptionFormDTO;

        const basic = await transactionEntityManager.save(
          this.positionDescriptionFormBasic.createEntity({ ...positionDescriptionFormDTO.basic, ...positionDescriptionFormDTO.certificateOfAppointment }),
        );
        const internal = await transactionEntityManager.save(
          this.positionDescriptionFormInternalContacts.createEntity({ postingApplicantId, ...positionDescriptionFormDTO.contacts.internal }),
        );
        const external = await transactionEntityManager.save(
          this.positionDescriptionFormExternalContacts.createEntity({ postingApplicantId, ...positionDescriptionFormDTO.contacts.external }),
        );
        const workingCondition = await transactionEntityManager.save(
          this.positionDescriptionFormWorkingConditionService.createEntity({ postingApplicantId, ...positionDescriptionFormDTO.workingCondition }),
        );
        return {
          basic,
          contacts: { internal, external },
          workingCondition,
        };
      });
      return result;
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Bad request creating positing description form.', HttpStatus.BAD_REQUEST);
    }
  }

  async hasDbmCsc(postingApplicantId: string) {
    try {
      return (
        await this.positionDescriptionFormBasic.entityRepository.query(
          `SELECT IF(count(posting_applicants_id_fk)>0,true,false) hasDbmCsc FROM position_description_form_basic WHERE posting_applicants_id_fk = ? `,
          [postingApplicantId],
        )
      )[0];
    } catch (error) { }
  }

  async getPositionDescriptionFormByPostingApplicantId(postingApplicantId: string) {
    try {
      console.log('asdasd');
      const { positionDetails, positionDescriptionFormBasic } = await this.positionDescriptionFormBasic.getPositionDescriptionFormBasicInfo(postingApplicantId);
      console.log('here');
      const internal = await this.positionDescriptionFormInternalContacts.getInternalContactFrequency(postingApplicantId);
      console.log(internal);
      const external = await this.positionDescriptionFormExternalContacts.getExternalContactFrequency(postingApplicantId);
      const workingCondition = await this.positionDescriptionFormWorkingConditionService.getWorkingConditionFrequency(postingApplicantId);
      const { generalFunctionOfUnit, jobSummary, education, experience, training, eligibility } = (
        await this.positionDescriptionFormBasic.entityRepository.query(
          `SELECT 
             get_function_of_unit_section(?) generalFunctionOfUnit,
             get_job_summary_by_item_number(?) jobSummary, 
             education, 
             experience, 
             training, 
             eligibility  
           FROM plantilla_positions pp
              INNER JOIN qualification_standards qs ON pp._id = qs.position_id_fk 
           WHERE pp._id = ?
          ;`,
          [positionDetails.positionId, positionDescriptionFormBasic.itemNumber, positionDetails.positionId],
        )
      )[0];

      /* const functionalManagerial = await this.positionDescriptionFormBasic.entityRepository.query(
        `
          SELECT cm.name competencyName,cm.desc description, p.level 'level' FROM competency_model cm 
          INNER JOIN domain d ON d._id = cm.domain_id_fk
            INNER JOIN proficiency p ON p.competency_id_fk = cm._id
            INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
            INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
            INNER JOIN plantilla_positions pp ON pp._id = og.position_id_fk 
          WHERE pp._id = ? AND (d.type='Functional' OR d.type='Cross-Cutting Functional' OR d.type='Leadership/Managerial');
      `,
        [positionDetails.positionId],
      ); */

      const functionalManagerial = await this.positionDescriptionFormBasic.entityRepository.query(
        `
        SELECT cm.name competencyName, cm.desc description, p.level 'level'   
          FROM occupational_group_duties_responsibilities ogdr
          INNER JOIN occupations_duties_responsibilities odr ON ogdr.odr_id_fk = odr._id
          INNER JOIN duties_responsibilities dr ON dr._id = odr.duties_responsibilities_id_fk
          INNER JOIN position_competency_proficiency_level pcpl ON pcpl._id = ogdr.pcpl_id_fk
          INNER JOIN proficiency p ON p._id = pcpl.proficiency_id_fk
          INNER JOIN competency_model cm on p.competency_id_fk = cm._id
          INNER JOIN domain d ON d._id = cm.domain_id_fk
          INNER JOIN occupational_group og ON og._id = ogdr.occupational_group_id_fk
          WHERE og.position_id_fk = ? 
          AND (d.type='Functional' OR d.type='Cross-Cutting Functional' OR d.type='Leadership/Managerial')
          ORDER BY percentage desc, competencyName asc;`,
        [positionDetails.positionId],
      );

      const core = await this.positionDescriptionFormBasic.entityRepository.query(
        `
          SELECT cm.name competencyName,cm.desc description, p.level 'level' FROM competency_model cm 
          INNER JOIN domain d ON d._id = cm.domain_id_fk
            INNER JOIN proficiency p ON p.competency_id_fk = cm._id
            INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
            INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
            INNER JOIN plantilla_positions pp ON pp._id = og.position_id_fk 
          WHERE pp._id = ? AND d.type='Core' ;
       `,
        [positionDetails.positionId],
      );

      const coreDuty = await this.occupationalGroupDutiesResponsibilities.getDutiesAndResponsibilitiesByPositionId(positionDetails.positionId, DutyType.CORE);
      const supportDuty = await this.occupationalGroupDutiesResponsibilities.getDutiesAndResponsibilitiesByPositionId(positionDetails.positionId, DutyType.SUPPORT);
      const employee = (
        await this.positionDescriptionFormBasic.entityRepository.query(
          `
        SELECT applicantName 
        FROM posting_applicants_detailed_view padv
          INNER JOIN applicant_endorsement ae ON ae.posting_applicant_id_fk = padv.postingApplicantId
        WHERE ae.status = ? AND posting_applicant_id_fk=? 
      `,
          [ApplicantEndorsementStatus.SELECTED_BY_APPOINTING_AUTHORITY, postingApplicantId],
        )
      )[0].applicantName;

      const requestingEntity = (
        await this.positionDescriptionFormBasic.entityRepository.query(
          `
        SELECT get_employee_fullname(vppp.employee_id_fk) employeeName, get_position_title_for_documents(get_employee_position_or_oic(vppp.employee_id_fk)) positionTitle FROM vpp_psb vppp 
              INNER JOIN posting_applicants pa ON pa.vacant_position_posting_id_fk = vppp.vacant_position_posting_id_fk 
        AND pa._id = ? AND vppp.psb_no = 2;
        `,
          [postingApplicantId],
        )
      )[0];

      return {
        positionDetails,
        positionDescriptionFormBasic,
        contacts: { internal, external },
        workingCondition,
        generalFunctionOfUnit,
        jobSummary,
        qualificationStandards: {
          education,
          experience,
          eligibility,
          training,
        },
        competencies: {
          core,
          functionalManagerial,
        },
        dutiesAndResponsibilities: {
          core: coreDuty,
          support: supportDuty,
        },
        signatories: {
          employee,
          requestingEntity,
        },
      };
    } catch (error) { }
  }

  async listCertifiedBy() {
    try {
      const certifiedBy = (await this.positionDescriptionFormBasic.entityRepository.query(`SELECT 
              pp.employee_id_fk employeeId,
                GET_EMPLOYEE_FULLNAME2(pp.employee_id_fk) name,
                pp.position_title positionTitle
            FROM
                plantilla_positions pp
                    INNER JOIN
                department_positions dp ON pp._id = dp.position_id_fk
                    INNER JOIN
                departments d ON dp.department_id_fk = d._id
            WHERE
                d.name = 'Human Resource Department'
                    AND pp.position_title = 'Department Manager A'
                    AND pp.employee_id_fk IS NOT NULL 
            UNION SELECT 
              pp.employee_id_fk employeeId,
                GET_EMPLOYEE_FULLNAME2(pp.employee_id_fk) name,
                pp.position_title positionTitle
            FROM
                plantilla_positions pp
                    INNER JOIN
                division_positions dp ON pp._id = dp.position_id_fk
                    INNER JOIN
                divisions d ON dp.division_id_fk = d._id
            WHERE
                d.name = 'Recruitment and Personnel Welfare Division'
                    AND pp.position_title = 'Division Manager A'
                    AND pp.employee_id_fk IS NOT NULL 
            UNION SELECT 
              employeeId,
                employeeFullName name, oicPosition positionTitle
            FROM
                officer_in_charge_view
            WHERE
                oicOrgName IN ('Recruitment and Personnel Welfare Division' , 'Human Resource Department')
                    AND oicPosition IN ('OIC-Division Manager' , 'OIC-Department Manager');
        `)) as Array<CertifiedList>;

      return Promise.all(
        certifiedBy.map(async (items) => {
          return {
            label: items.name,
            value: {
              employeeId: items.employeeId,
              positionTitle: items.positionTitle,
            },
          };
        }),
      );
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* update position description form by posting application id */
  async updatePositionDescriptionForm(data: UpdatePositionDescriptionFormDto) {
    try {
      return await getManager().transaction(async (entityManager) => {
        /* deconstruct data */
        const {
          basic: { postingApplicantId, ...rest },
          workingCondition,
          contacts: { internal, external },
          certificateOfAppointment,
        } = data;

        /* update basic form */
        const basics = await entityManager
          .createQueryBuilder()
          .update(PositionDescriptionFormBasic)
          .set({ ...rest, ...certificateOfAppointment })
          .where('posting_applicants_id_fk = :id', { id: postingApplicantId })
          .execute();

        /* update working conditions */
        const workingConditions = await entityManager
          .createQueryBuilder()
          .update(PositionDescriptionFormWorkingCondition)
          .set(workingCondition)
          .where('posting_applicants_id_fk = :id', { id: postingApplicantId })
          .execute();

        /* update contacts internal */
        const contactsInternal = await entityManager
          .createQueryBuilder()
          .update(PositionDescriptionFormInternalContacts)
          .set(internal)
          .where('posting_applicants_id_fk = :id', { id: postingApplicantId })
          .execute();

        /* update contacts external */
        const contactsExternal = await entityManager
          .createQueryBuilder()
          .update(PositionDescriptionFormExternalContacts)
          .set(external)
          .where('posting_applicants_id_fk = :id', { id: postingApplicantId })
          .execute();

        if (basics.affected > 0 && workingConditions.affected > 0 && contactsInternal.affected > 0 && contactsExternal.affected > 0) return data;
        else throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      });
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  /* find position description form by posting applicant id */
  async findPositionDescriptionFormByPostingApplicantId(applicantId: string) {
    try {
      const basicInfo = await this.positionDescriptionFormBasic.findBasicInfoByPostingApplicantId(applicantId);
      const internal = await this.positionDescriptionFormInternalContacts.entityRepository.findOne({ where: { postingApplicantId: applicantId } });
      const external = await this.positionDescriptionFormExternalContacts.entityRepository.findOne({ where: { postingApplicantId: applicantId } });
      const workingCondition = await this.positionDescriptionFormWorkingConditionService.entityRepository.findOne({ where: { postingApplicantId: applicantId } });
      return {
        basic: {
          postingApplicantId: applicantId,
          itemNumber: basicInfo.itemNumber,
          immediateSupervisor: basicInfo.immediateSupervisor,
          supervisorNextHigher: basicInfo.supervisorNextHigher,
          toolsUsed: basicInfo.toolsUsed,
          workStation: basicInfo.workStation,
          appointmentType: basicInfo.appointmentType,
          publicationMode: basicInfo.publicationMode,
          directlySupervised: basicInfo.directlySupervised,
        },
        contacts: {
          internal: {
            executiveIsOccasional: internal.executiveIsOccasional,
            supervisorIsOccasional: internal.supervisorIsOccasional,
            nonSupervisorIsOccasional: internal.nonSupervisorIsOccasional,
            staffIsOccasional: internal.staffIsOccasional,
          },
          external: {
            generalPublicIsOccasional: external.generalPublicIsOccasional,
            otherAgenciesIsOccasional: external.otherAgenciesIsOccasional,
            others: external.others,
          },
        },
        workingCondition: {
          isOfficeWork: workingCondition.isOfficeWork,
          isFieldWork: workingCondition.isFieldWork,
          others: workingCondition.others,
        },
        certificateOfAppointment: {
          natureOfAppointment: basicInfo.natureOfAppointment,
          vice: basicInfo.vice,
          viceType: basicInfo.viceType,
          fieldPage: basicInfo.fieldPage,
          certifiedBy: basicInfo.certifiedBy,
          psbDurationStartDate: basicInfo.psbDurationStartDate,
        },
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Position description form not found.', HttpStatus.NOT_FOUND);
    }
  }
}
