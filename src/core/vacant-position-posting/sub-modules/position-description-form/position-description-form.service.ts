import { ApplicantEndorsementStatus } from './../applicant-endorsement/utils/types/applicant-endorsement.enum';
import { OccupationalGroupDutiesResponsibilitiesService } from './../../../occupational-group-duties-responsibilities/occupational-group-duties-responsibilities.service';
import { PositionDescriptionFormDTO } from './data/position-description-form.dto';
import { PositionDescriptionFormWorkingConditionService } from './parts/working-condition/working-condition.service';
import { PositionDescriptionFormExternalContactsService } from './parts/contacts/external/external-contacts.service';
import { PositionDescriptionFormInternalContactsService } from './parts/contacts/internal/internal-contacts.service';
import { PositionDescriptionFormBasicService } from './parts/basic/basic.service';
import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { DutyType } from 'src/core/occupational-group-duties-responsibilities/utils/enums/duty-type.enum';
import { CertifiedOfAppointmentDto } from './parts/basic/data/position-description-form-basic.dto';

@Injectable()
export class PositionDescriptionFormService {
  constructor(
    private readonly positionDescriptionFormBasic: PositionDescriptionFormBasicService,
    private readonly positionDescriptionFormInternalContacts: PositionDescriptionFormInternalContactsService,
    private readonly positionDescriptionFormExternalContacts: PositionDescriptionFormExternalContactsService,
    private readonly positionDescriptionFormWorkingConditionService: PositionDescriptionFormWorkingConditionService,
    private readonly occupationalGroupDutiesResponsibilities: OccupationalGroupDutiesResponsibilitiesService,
  ) {}

  async savePositionDescriptionForm(postingApplicantId: string, positionDescriptionFormDTO: PositionDescriptionFormDTO) {
    try {
      const result = await getManager().transaction(async (transactionEntityManager) => {
        const basic = await transactionEntityManager.save(
          this.positionDescriptionFormBasic.createEntity({ postingApplicantId, ...positionDescriptionFormDTO.basic, ...positionDescriptionFormDTO.certificateOfAppointment }),
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
    } catch (error) {}
  }

  async hasDbmCsc(postingApplicantId: string) {
    try {
      return (
        await this.positionDescriptionFormBasic.entityRepository.query(
          `SELECT IF(count(posting_applicants_id_fk)>0,true,false) hasDbmCsc FROM position_description_form_basic WHERE posting_applicants_id_fk = ? `,
          [postingApplicantId],
        )
      )[0];
    } catch (error) {}
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
        SELECT get_employee_fullname(vppp.employee_id_fk) employeeName, get_employee_position_or_oic(vppp.employee_id_fk) positionTitle FROM vpp_psb vppp 
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
    } catch (error) {}
  }
}
