import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PostingApplicantsDetailedView } from './data/posting-applicants-detailed.view';

@Injectable()
export class PostingApplicantsDetailedViewService extends BaseEntityCrudService<PostingApplicantsDetailedView> {
  constructor(@InjectRepository(PostingApplicantsDetailedView) applicantsDetailedView: Repository<PostingApplicantsDetailedView>) {
    super(applicantsDetailedView);
  }

  async getApplicantPerPosting(vppId: string, employeeId: string, postingApplicantId: string) {
    const applicant = await this.entityRepository.findOne({
      select: ['postingApplicantId', 'applicantId', 'applicantName', 'applicantName', 'applicantType', 'assignedTo', 'positionTitle'],
      where: { vppId, postingApplicantId },
    });

    const psbMember = await this.entityRepository
      .createQueryBuilder('padv')
      .select('get_employee_fullname(vpp_psb.employee_id_fk)', 'name')
      .addSelect('vpa.remarks', 'remarks')
      .addSelect('vpa.exam_result', 'examResult')
      .addSelect('vpa.interviewed', 'interviewed')
      .addSelect('vpa._id', 'ID')
      .addSelect("concat('PSB #',vpp_psb.psb_no)", 'role')
      .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
      .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
      .innerJoin('vpp_psb_applicants', 'vpa', 'vpa.vpp_psb_id_fk = vpp_psb._id')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where('vpp_psb.employee_id_fk = :employeeId AND padv.vppId=:vppId AND vpa.posting_applicants_id_fk=:applicantId', {
        employeeId,
        vppId,
        applicantId: applicant.postingApplicantId,
      })
      .getRawOne();

    const coreScores = await this.entityRepository
      .createQueryBuilder('padv')
      .select('vir._id', 'ratingId')
      .addSelect('cm.code', 'competencyCode')
      .addSelect('cm.name', 'competencyName')
      .addSelect('cm.desc', 'description')
      .addSelect('p.level', 'proficiencyLevel')
      .addSelect('p.key_actions', 'keyActions')
      .addSelect('vir.rating', 'rating')
      .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
      .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')

      .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND d.type='Core' AND posting_applicants_id_fk=:applicantId", {
        employeeId,
        vppId,
        applicantId: applicant.postingApplicantId,
      })
      .orderBy('competencyCode', 'ASC')
      .getRawMany();

    const functionalScores = await this.entityRepository
      .createQueryBuilder('padv')
      .select('vir._id', 'ratingId')
      .addSelect('cm.code', 'competencyCode')
      .addSelect('cm.name', 'competencyName')
      .addSelect('cm.desc', 'description')
      .addSelect('p.level', 'proficiencyLevel')
      .addSelect('p.key_actions', 'keyActions')
      .addSelect('vir.rating', 'rating')
      .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
      .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')

      .where(
        "vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND (d.type='Functional' OR d.type='Cross-Cutting Functional') AND vir.posting_applicants_id_fk=:applicantId",
        {
          employeeId,
          vppId,
          applicantId: applicant.postingApplicantId,
        },
      )
      .orderBy('competencyCode', 'ASC')
      .getRawMany();

    const managerialScores = await this.entityRepository
      .createQueryBuilder('padv')
      .select('vir._id', 'ratingId')
      .addSelect('cm.code', 'competencyCode')
      .addSelect('cm.name', 'competencyName')
      .addSelect('cm.desc', 'description')
      .addSelect('p.level', 'proficiencyLevel')
      .addSelect('vir.rating', 'rating')
      .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
      .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')

      .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND (d.type='Leadership/Managerial') AND vir.posting_applicants_id_fk=:applicantId", {
        employeeId,
        vppId,
        applicantId: applicant.postingApplicantId,
      })
      .orderBy('competencyCode', 'ASC')
      .getRawMany();

    return {
      ...applicant,
      remarks: psbMember.remarks,
      examResult: psbMember.examResult,
      interviewed: psbMember.interviewed,
      psbMember: { name: psbMember.name, role: psbMember.role, id: psbMember.ID },
      competencies: { coreScores, functionalScores, managerialScores },
    };
  }

  async getApplicantsPerPosting(vppId: string, employeeId: string) {
    //TODO: GET ONLY THE APPLICANTS SELECTED BY REQUESTING ENTITY FOR INTERVIEW
    // const applicants = await this.entityRepository.find({
    //   select: ['postingApplicantId', 'applicantId', 'applicantName', 'applicantName', 'applicantType', 'assignedTo', 'positionTitle'],
    //   where: { vppId },
    // });

    const psbMemberDetails = (
      await this.entityRepository.query(
        `
    SELECT get_employee_fullname(employee_id_fk) fullName, CONCAT('PSB ',psb_no) role, get_signature_url(employee_id_fk) signatureUrl
    FROM vpp_psb WHERE employee_id_fk=? AND vacant_position_posting_id_fk=?`,
        [employeeId, vppId],
      )
    )[0];

    const applicants = await this.entityRepository
      .createQueryBuilder('padv')
      .select('padv.postingApplicantId', 'postingApplicantId')
      .addSelect('padv.applicantId', 'applicantId')
      .addSelect('padv.applicantName', 'applicantName')
      .addSelect('padv.applicantName2', 'applicantName2')
      .addSelect('padv.applicantType', 'applicantType')
      .addSelect('padv.assignedTo', 'assignedTo')
      .addSelect('padv.positionTitle', 'positionTitle')
      .innerJoin('applicant_endorsement', 'ae', 'ae.posting_applicant_id_fk = padv.postingApplicantId')
      .where(`(ae.status = 'Selected by requesting entity' OR ae.status='Selected by appointing authority' )AND padv.vppId = :vppId`, { vppId })
      .getRawMany();

    const applicantsScores = await Promise.all(
      applicants.map(async (applicant) => {
        const psbMember = await this.entityRepository
          .createQueryBuilder('padv')
          //.select('get_employee_fullname(vpp_psb.employee_id_fk)', 'name')
          .select('vpa.remarks', 'remarks')
          .addSelect('padv.examScore', 'examResult')
          .addSelect('vpa.interviewed', 'interviewed')
          .addSelect('vpa._id', 'ID')
          .addSelect("concat('PSB #',vpp_psb.psb_no)", 'role')
          .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
          .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
          .innerJoin('vpp_psb_applicants', 'vpa', 'vpa.vpp_psb_id_fk = vpp_psb._id')
          .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
          .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
          .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
          .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
          .where('vpp_psb.employee_id_fk = :employeeId  AND padv.vppId=:vppId AND padv.postingApplicantId= :padvApplicantId AND vpa.posting_applicants_id_fk=:applicantId;', {
            employeeId,
            vppId,
            padvApplicantId: applicant.postingApplicantId,
            applicantId: applicant.postingApplicantId,
          })
          .getRawOne();

        const coreScores = await this.entityRepository
          .createQueryBuilder('padv')
          .select('vir._id', 'ratingId')
          .addSelect('cm.code', 'competencyCode')
          .addSelect('cm.name', 'competencyName')
          .addSelect('cm.desc', 'description')
          .addSelect('p.level', 'proficiencyLevel')
          .addSelect('vir.rating', 'rating')
          .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
          .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
          .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
          .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
          .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
          .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')

          .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND d.type='Core' AND posting_applicants_id_fk=:applicantId", {
            employeeId,
            vppId,
            applicantId: applicant.postingApplicantId,
          })
          .orderBy('competencyCode', 'ASC')
          .getRawMany();

        const { coreAverage } = await this.entityRepository
          .createQueryBuilder('padv')
          .select('TRUNCATE(AVG(vir.rating),2)', 'coreAverage')
          .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
          .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
          .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
          .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
          .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
          .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
          .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND d.type='Core' AND posting_applicants_id_fk=:applicantId", {
            employeeId,
            vppId,
            applicantId: applicant.postingApplicantId,
          })
          .getRawOne();

        const functionalScores = await this.entityRepository
          .createQueryBuilder('padv')
          .select('vir._id', 'ratingId')
          .addSelect('cm.code', 'competencyCode')
          .addSelect('cm.name', 'competencyName')
          .addSelect('cm.desc', 'description')
          .addSelect('p.level', 'proficiencyLevel')
          .addSelect('vir.rating', 'rating')
          .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
          .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
          .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
          .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
          .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
          .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')

          .where(
            "vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND (d.type='Functional' OR d.type='Cross-Cutting Functional') AND posting_applicants_id_fk=:applicantId",
            {
              employeeId,
              vppId,
              applicantId: applicant.postingApplicantId,
            },
          )
          .orderBy('competencyCode', 'ASC')
          .getRawMany();

        const { functionalAverage } = await this.entityRepository
          .createQueryBuilder('padv')
          .select('TRUNCATE(AVG(vir.rating),2)', 'functionalAverage')
          .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
          .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
          .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
          .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
          .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
          .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
          .where(
            "vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND (d.type='Functional' OR d.type='Cross-Cutting Functional') AND posting_applicants_id_fk=:applicantId;",
            {
              employeeId,
              vppId,
              applicantId: applicant.postingApplicantId,
            },
          )
          .getRawOne();

        const managerialScores = await this.entityRepository
          .createQueryBuilder('padv')
          .select('vir._id', 'ratingId')
          .addSelect('cm.code', 'competencyCode')
          .addSelect('cm.name', 'competencyName')
          .addSelect('cm.desc', 'description')
          .addSelect('p.level', 'proficiencyLevel')
          .addSelect('vir.rating', 'rating')
          .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
          .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
          .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
          .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
          .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
          .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
          .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND (d.type='Leadership/Managerial') AND posting_applicants_id_fk=:applicantId", {
            employeeId,
            vppId,
            applicantId: applicant.postingApplicantId,
          })
          .orderBy('competencyCode', 'ASC')
          .getRawMany();

        const { managerialAvg } = await this.entityRepository
          .createQueryBuilder('padv')
          .select('TRUNCATE(AVG(vir.rating),2)', 'managerialAvg')
          .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
          .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
          .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
          .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
          .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
          .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
          .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND (d.type='Leadership/Managerial') AND posting_applicants_id_fk=:applicantId;", {
            employeeId,
            vppId,
            applicantId: applicant.postingApplicantId,
          })
          .getRawOne();

        let _managerial = 0;
        if (managerialAvg !== null) _managerial = managerialAvg;

        const totalAverage = parseFloat(coreAverage) + parseFloat(functionalAverage) + _managerial;

        return {
          ...applicant,
          remarks: psbMember.remarks,
          examResult: parseFloat(psbMember.examResult),
          interviewed: psbMember.interviewed,
          //psbMember: { name: psbMember.name, role: psbMember.role, id: psbMember.ID },
          competencies: { coreScores, coreAverage, functionalScores, functionalAverage, managerialScores, managerialAvg, totalAverage },
        };
      }),
    );

    const recommendation = (
      await this.entityRepository.query(
        `
        SELECT recommendation, DATE_FORMAT(recommendation_date, '%Y-%m-%d') recommendationDate 
        FROM vpp_psb WHERE vacant_position_posting_id_fk = ? AND employee_id_fk = ? 
    `,
        [vppId, employeeId],
      )
    )[0];

    const _applicantScores = await Promise.all(applicantsScores.sort((a, b) => (a.competencies.totalAverage > b.competencies.totalAverage ? -1 : 1)));

    console.log(_applicantScores);
    return {
      psbMemberDetails,
      applicantsScores: _applicantScores,
      ...recommendation,
    };
  }

  async getQualifiedApplicantsByVppId(vppId: string) {
    try {
      return await this.entityRepository.find({
        select: ['postingApplicantId', 'applicantName2', 'examScore'],
        where: { vppId, applicantStatus: 'Qualified' },
        order: { applicantName2: 'ASC' },
      });
    } catch (error) {
      throw new HttpException('', 500);
    }
  }

  private async getCompetencyScores(employeeId: string, vppId: string, applicantId: string, domain: string) {
    // let query = '';
    // if(domain = '')
    return await this.entityRepository
      .createQueryBuilder('padv')
      .select('vir._id', 'ratingId')
      .addSelect('cm.code', 'competencyCode')
      .addSelect('cm.name', 'competencyName')
      .addSelect('cm.desc', 'description')
      .addSelect('p.level', 'proficiencyLevel')
      .addSelect('vir.rating', 'rating')
      .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
      .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND d.type='Core' AND posting_applicants_id_fk=:applicantId;", {
        employeeId,
        vppId,
        applicantId,
      })
      .getRawMany();

    await this.entityRepository
      .createQueryBuilder('padv')
      .select('vir._id', 'ratingId')
      .addSelect('cm.code', 'competencyCode')
      .addSelect('cm.name', 'competencyName')
      .addSelect('cm.desc', 'description')
      .addSelect('p.level', 'proficiencyLevel')
      .addSelect('vir.rating', 'rating')
      .innerJoin('vpp_interview_rating', 'vir', 'vir.posting_applicants_id_fk = padv.postingApplicantId')
      .innerJoin('vpp_psb', 'vpp_psb', 'vpp_psb._id = vir.vpp_psb_id_fk')
      .innerJoin('position_competency_proficiency_level', 'pcpl', 'pcpl._id = vir.pcpl_id_fk')
      .innerJoin('proficiency', 'p', 'p._id = pcpl.proficiency_id_fk')
      .innerJoin('competency_model', 'cm', 'cm._id = p.competency_id_fk')
      .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
      .where("vpp_psb.employee_id_fk = :employeeId AND padv.vppId = :vppId AND (d.type='Leadership/Managerial') AND posting_applicants_id_fk=:applicantId;", {
        employeeId,
        vppId,
        applicantId,
      })
      .getRawMany();
  }

  async getConfirmedExternalApplicants() {
    try {
      const confirmedExternalApplicantsResult = await this.entityRepository.query(`
    SELECT applicantId,applicantName2 applicantName,applicantFirstName,applicantMiddleName,applicantLastName, applicantNameExtension,vppv.positionId positionId,vppv.itemNumber itemNumber,vppv.positionTitle positionTitle, vppv.salaryGradeLevel salaryGradeLevel,ea.email email
      FROM posting_applicants_detailed_view padv 
    INNER JOIN vacant_position_posting_view vppv ON vppv.vppId = padv.vppId
    INNER JOIN position_description_form_basic pdfb ON pdfb.item_number = vppv.itemNumber
    INNER JOIN external_applicants ea ON ea._id = padv.applicantId 
    WHERE applicantType=CAST('external' AS BINARY) AND applicantStatus=CAST('Accepted' AS BINARY);`);

      const confirmedExternalApplicants = await Promise.all(
        confirmedExternalApplicantsResult.map(async (externalApplicant) => {
          const {
            applicantId,
            applicantName,
            applicantFirstName,
            applicantMiddleName,
            applicantLastName,
            applicantNameExtension,
            email,
            salaryGradeLevel,
            positionId,
            itemNumber,
            positionTitle,
          } = externalApplicant;
          return {
            label: applicantName,
            value: {
              applicantId,
              applicantName,
              applicantFirstName,
              applicantMiddleName,
              applicantLastName,
              applicantNameExtension,
              email,
              salaryGradeLevel,
              positionId,
              itemNumber,
              positionTitle,
            },
          };
        }),
      );
      return confirmedExternalApplicants;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
