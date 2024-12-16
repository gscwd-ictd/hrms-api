import { PDSBasicPersonalInfoService } from './../applicants/external-applicants/pds/parts/basic-info/pds-basic-personal-info/pds-basic-personal-info.service';
import { PDSBasicResidentialAddressService } from './../applicants/external-applicants/pds/parts/basic-info/address/pds-basic-residential-address/pds-basic-residential-address.service';
import { ApplicantEndorsementService } from './../applicant-endorsement/applicant-endorsement.service';
import { PostingApplicantsDetailedViewService } from './../applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.service';
import { HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { VppInterviewRating } from './data/entities/vpp-interview-rating.entity';
import { VppInterviewRatingUpdateDTO } from './data/dtos/vpp-interview-rating.dto';
import { VppPsbApplicantsService } from '../vpp-psb-applicants/vpp-psb-applicants.service';
import { QualificationStandardsService } from 'src/core/qualification-standards/qualification-standards.service';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { lastValueFrom } from 'rxjs';
import { PDSBasicResidentialAddress } from '../applicants/external-applicants/pds/parts/basic-info/address/pds-basic-residential-address/data/entities/pds-basic-residential-address.entity';

@Injectable()
export class VppInterviewRatingService extends BaseEntityCrudService<VppInterviewRating> {
  constructor(
    @InjectRepository(VppInterviewRating) private readonly vppInterviewRatingRepository: Repository<VppInterviewRating>,
    private readonly vppPsbApplicantsService: VppPsbApplicantsService,
    private readonly qualificationStandardsService: QualificationStandardsService,
    private readonly postingApplicantsDetailedViewService: PostingApplicantsDetailedViewService,
    private readonly applicantEndorsementService: ApplicantEndorsementService,
    private readonly pdsBasicResidentialAddressService: PDSBasicResidentialAddressService,
    private readonly pdsBasicPersonalInfoService: PDSBasicPersonalInfoService,
    @Inject(MicroserviceType.AUTHN) public client: ClientProxy,
  ) {
    super(vppInterviewRatingRepository);
  }

  /**
   * @Description FORM HRD 002-3 includes both competency based-interview report and comparative evaluation of applicants
   * @Param vppId ;
   */
  async getFormHrd002_3PerPsb(vppId: string) {
    //1. get all psb members per posting;
    const psbMembers = await this.entityRepository.query(
      `SELECT employee_id_fk employeeId FROM vpp_psb WHERE vacant_position_posting_id_fk=? AND acknowledged_schedule=1 AND declined_schedule = 0 AND done=1 ORDER BY psb_no ASC;`,
      [vppId],
    );

    const formData = await Promise.all(
      psbMembers.map(async (psbMember) => {
        //2.  per psb generate competency based report
        const competencyBasedInterviewReport = await this.postingApplicantsDetailedViewService.getApplicantsPerPosting(vppId, psbMember.employeeId);
        //3. generate Comparative Evaluation of Applicants Report
        const comparativeEvaluationOfApplicants = await this.getRatingOfApplicantsPerPosting(vppId, psbMember.employeeId);
        return {
          competencyBasedInterviewReport,
          comparativeEvaluationOfApplicants,
        };
      }),
    );

    return formData;
  }

  async getFormHrd005_2ByEffectivityDate(effectivityDate: Date) {
    try {
      const resultsOfHiring = await this.applicantEndorsementService.getHiringProcessResults(effectivityDate);
      const signatories = await this.entityRepository.query(`
      (((
        SELECT get_employee_fullname(e._id) fullName,
              get_employee_assignment(e._id) assignment, 
              get_employee_position(e._id) position, 
              get_signature_url(e._id) signatureUrl
         FROM plantilla_positions pp
           INNER JOIN department_positions dp ON pp._id = dp.position_id_fk 
           INNER JOIN departments d ON d._id = dp.department_id_fk
           INNER JOIN employees e ON e._id = pp.employee_id_fk
        WHERE cast(d.name AS binary) = 'Human Resource Department' AND cast(pp.position_title AS binary) = 'Department Manager A'
    )
    UNION
    (
       SELECT employeeFullName fullName, 
           oicOrgName assignment,
           oicPosition position,
           get_signature_url(employeeId) signatureUrl
       FROM officer_in_charge_view 
       WHERE cast(oicPosition as binary) = 'OIC-Department Manager' AND  cast(oicOrgName as binary) ='Human Resource Department'
    ))
    UNION
    (
    	SELECT get_employee_fullname(e._id) fullName,
              get_employee_assignment(e._id) assignment, 
              get_employee_position(e._id) position, 
              get_signature_url(e._id) signatureUrl
         FROM plantilla_positions pp
           INNER JOIN office_positions op ON pp._id = op.position_id_fk 
           INNER JOIN office o ON o._id = op.office_id_fk
           INNER JOIN employees e ON e._id = pp.employee_id_fk
        WHERE cast(o.name AS binary) = 'Office of the Assistant General Manager for Administration' AND cast(pp.position_title AS binary) = 'Assistant General Manager'
    ))
    UNION
    ( SELECT * FROM ((SELECT 
      get_employee_fullname(employee_id_fk) fullName,
      get_employee_assignment(employee_id_fk) assignment,
      get_employee_position(employee_id_fk) position, 
      get_signature_url(employee_id_fk) signatureUrl
      FROM plantilla_positions 
    WHERE position_title='General Manager A')
    UNION
    (
      SELECT
         
      get_employee_fullname(employeeId) fullName,
      oicv.oicOrgName assignment,
      oicv.oicPosition position,
      get_signature_url(employeeId) signatureUrl 
       FROM officer_in_charge_view oicv
      WHERE oicv.oicPosition=CAST('OIC-General Manager' AS BINARY)
    )) signatory WHERE signatory.fullName IS NOT NULL)
    ;`);

      let approvedByIndex = 1;
      if ((signatories.length = 3)) approvedByIndex = 2;

      return { resultsOfHiring, signatories: { certifiedCorrectBy: signatories[0], approvedBy: signatories[2] } };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  //DOCUMENT: COMPARATIVE EVALUATION OF APPLICANTS PER PSB
  async getRatingOfApplicantsPerPosting(vppId: string, employeeId: string) {
    try {
      const criteria = (await this.entityRepository.query(`CALL sp_get_vpp_criteria(?)`, [vppId]))[0][0];
      const applicantsRating = (await this.entityRepository.query(`CALL sp_get_applicants_rating(?,?);`, [vppId, employeeId]))[0];
      const { schedule } = (
        await this.entityRepository.query(
          `SELECT DATE_FORMAT(schedule,'%M %d, %Y %h:%i %p') schedule 
              FROM vpp_schedule 
           WHERE vacant_position_posting_id_fk=? AND schedule_type='interview'`,
          [vppId],
        )
      )[0];
      //GET positionId of the posting
      const positionDetails = (
        await this.entityRepository.query(
          `SELECT pp._id positionId,
          pp.position_title positionTitle,
          get_plantilla_salary_grade(pp._id) salaryGrade,
          pp.nature_of_appointment natureOfAppointment,
          get_position_assignment(pp._id) assignedTo
            FROM vpp_positions vppp 
          INNER JOIN plantilla_positions pp ON pp._id = vppp.prf_positions_positions_id_fk 
          WHERE vppp.vacant_position_posting_id_fk = ? LIMIT 1`,
          [vppId],
        )
      )[0];

      const { education, training, eligibility, experience } = await this.qualificationStandardsService.getQsByPositionId(positionDetails.positionId);
      return { schedule, positionDetails: { ...positionDetails, qualificationStandards: { education, training, eligibility, experience } }, criteria, applicantsRating };
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async rankingOfApplicants(vppId: string) {
    const { numberOfApplicants } = (
      await this.entityRepository.query(
        `
      SELECT COUNT(_id) numberOfApplicants 
        FROM posting_applicants 
      WHERE vacant_position_posting_id_fk = ?`,
        [vppId],
      )
    )[0];

    const { numberOfQualifiedApplicants } = (
      await this.entityRepository.query(
        `SELECT count(ae._id) numberOfQualifiedApplicants 
         FROM applicant_endorsement ae 
            INNER JOIN posting_applicants pa ON pa._id = ae.posting_applicant_id_fk 
         WHERE vacant_position_posting_id_fk = ? AND (ae.status = 'Selected by requesting entity' OR ae.status = 'Selected by appointing authority') ;`,
        [vppId],
      )
    )[0];

    const positionDetails = (
      await this.entityRepository.query(
        `SELECT DISTINCT positionTitle, 
          get_position_assignment(positionId) assignedTo,
          get_assignment_organization(get_position_assignment_id(positionId)) orgType,
          postingStatus 
        FROM vacant_position_posting_publication_view WHERE vppId = ?`,
        [vppId],
      )
    )[0];

    const { dateOfPanelInterview } =
      (
        await this.entityRepository.query(
          `SELECT DATE_FORMAT(schedule,'%M %d, %Y %h:%i%p') dateOfPanelInterview 
          FROM vpp_schedule 
         WHERE vacant_position_posting_id_fk=? AND schedule_type='interview'`,
          [vppId],
        )
      ).length > 0
        ? (
          await this.entityRepository.query(
            `SELECT DATE_FORMAT(schedule,'%M %d, %Y %h:%i%p') dateOfPanelInterview 
        FROM vpp_schedule 
       WHERE vacant_position_posting_id_fk=? AND schedule_type='interview'`,
            [vppId],
          )
        )[0]
        : { dateOfPanelInterview: null };

    const { allPsbSubmitted } = (
      await this.entityRepository.query(
        `SELECT IF(((psb.countDone = psb.countAcknowledged) AND (psb.countAcknowledged > 0)), true, false) allPsbSubmitted 
        FROM ( SELECT sum(done) countDone, 
        sum(acknowledged_schedule) countAcknowledged 
        FROM vpp_psb WHERE vacant_position_posting_id_fk = ? ) psb;`,
        [vppId],
      )
    )[0];

    const { numberOfInterviewedApplicants } = (
      await this.entityRepository.query(
        `SELECT COUNT(distinct posting_applicants_id_fk) numberOfInterviewedApplicants 
            FROM vpp_psb_applicants vpa 
                INNER JOIN posting_applicants pa ON pa._id = vpa.posting_applicants_id_fk 
            WHERE pa.vacant_position_posting_id_fk = ? AND interviewed=1`,
        [vppId],
      )
    )[0];
    let ranking;
    try {
      ranking = (await this.entityRepository.query(`CALL sp_get_ranking_of_applicants(?);`, [vppId]))[0];
    } catch {
      ranking = [];
    }

    const interviewDone = (
      await this.entityRepository.query(`SELECT IF(posting_status = 'Interview done', true,false) interviewDone FROM vacant_position_posting WHERE _id=?`, [vppId])
    )[0].interviewDone;

    const salaryGrade = (await this.entityRepository.query(`SELECT salaryGradeLevel FROM vacant_position_posting_view`))[0].salaryGradeLevel;
    const postingDate = (
      await this.entityRepository.query(
        `SELECT 
          CONCAT( DATE_FORMAT(posting_date,'%M %d'),' to ',DATE_FORMAT(posting_deadline,'%M %d, %Y')) postingDate 
         FROM vacant_position_posting WHERE _id = ?`,
        [vppId],
      )
    )[0].postingDate;

    console.table(ranking);
    const signatories = await this.entityRepository.query(
      `(
    SELECT
      get_signature_url(employee_id_fk) signatureUrl,
      get_employee_fullname(employee_id_fk) fullName,
      get_employee_position(employee_id_fk) position,
      get_employee_assignment(employee_id_fk) assignment, 
      CONCAT('PSB ',psb_no) role FROM vpp_psb 
    WHERE vacant_position_posting_id_fk=? AND 
    employee_id_fk IS NOT NULL AND declined_schedule = 0 AND done = 1
    )
    UNION
    (
      SELECT *,'Appointing authority' role FROM ((SELECT
        get_signature_url(employee_id_fk) signatureUrl,
        get_employee_fullname(employee_id_fk) fullName,
        get_employee_position(employee_id_fk) position,
        get_employee_assignment(employee_id_fk) assignment 
        FROM plantilla_positions 
      WHERE position_title='General Manager A')
      UNION
      (
      	SELECT
        get_signature_url(employeeId) signatureUrl,
        get_employee_fullname(employeeId) fullName,
        oicv.oicPosition position,
        oicv.oicOrgName assignment
         FROM officer_in_charge_view oicv
        WHERE oicv.oicPosition=CAST('OIC-General Manager' AS BINARY)
      )) signatory WHERE signatory.fullName IS NOT NULL
    )
    `,
      [vppId],
    );
    return {
      positionDetails,
      ranking,
      postingDate,
      numberOfApplicants,
      dateOfPanelInterview,
      salaryGrade,
      numberOfQualifiedApplicants,
      numberOfInterviewedApplicants,
      interviewDone,
      allPsbSubmitted,
      signatories,
    };
  }

  async updateVppInterviewRating(employeeId: string, postingApplicantsId: string, vppInterviewRatingDTO: VppInterviewRatingUpdateDTO) {
    const vppId = (await this.entityRepository.query('SELECT vppId FROM posting_applicants_detailed_view WHERE postingApplicantId = ? ', [postingApplicantsId]))[0].vppId;
    const vppPsbId = (await this.entityRepository.query('SELECT _id AS vppPsbId FROM vpp_psb WHERE vacant_position_posting_id_fK=? AND employee_id_fk = ?', [vppId, employeeId]))[0]
      .vppPsbId;

    const updatedVppInterviewRating = await Promise.all(
      vppInterviewRatingDTO.ratings.map(async (vppInterviewRating) => {
        const vppInterviewRatingUpdateResult = await this.vppInterviewRatingRepository
          .createQueryBuilder()
          .update()
          .set({ rating: vppInterviewRating.rating })
          .where('_id = :_id', { _id: vppInterviewRating.ratingId })
          .execute();
        if (vppInterviewRatingUpdateResult.affected > 0) return vppInterviewRating;
      }),
    );

    await this.vppPsbApplicantsService.entityRepository
      .createQueryBuilder()
      .update()
      .set({ interviewed: true, remarks: vppInterviewRatingDTO.remarks })
      .where('vpp_psb_id_fk=:vppPsbId AND posting_applicants_id_fk=:postingApplicantsId', { vppPsbId, postingApplicantsId })
      .execute();

    return { updatedVppInterviewRating };
  }

  async getCscForm4(postingApplicantId: string) {
    const data = (
      await this.entityRepository.query(
        `
    SELECT DISTINCT 
    padv.applicantName applicantName,
    vppv.positionTitle positionTitle,
    vppv.placeOfAssignment placeOfAssignment, 
    DATE_FORMAT(padv.effectivityDate,'%M %d, %Y') effectivityDateMdy,
    DATE_FORMAT(padv.effectivityDate,'%D day of %M, %Y') effectivityDateDmy
    FROM position_description_form_basic pdfb 
        INNER JOIN posting_applicants_detailed_view padv ON padv.postingApplicantId = pdfb.posting_applicants_id_fk
        INNER JOIN vacant_position_posting_publication_view vppv ON padv.vppId = vppv.vppId
        INNER JOIN plantilla_positions pp ON pp.item_number = pdfb.item_number
    WHERE padv.applicantStatus = 'Accepted' AND padv.postingApplicantId=?; 
    `,
        [postingApplicantId],
      )
    )[0];

    const signatories = await this.entityRepository.query(
      `
    select * FROM ((
      (SELECT
        get_employee_fullname(employee_id_fk) fullName,
        get_employee_position(employee_id_fk) position,
        get_employee_assignment(employee_id_fk) assignment, 
        'Appointing Authority' role FROM plantilla_positions 
      WHERE position_title='General Manager A') UNION (
        SELECT employeeFullName fullName,
        oicPosition position,
        oicOrgName assignment,
        'Appointing Authority' role FROM officer_in_charge_view 
        WHERE oicPosition=CAST('OIC-General Manager' as binary) AND oicOrgName=CAST('Office of the General Manager' AS BINARY)
      )
    )
    UNION
    (
      (SELECT
      get_employee_fullname(employee_id_fk) fullName,
      get_employee_position(employee_id_fk) position,
      get_employee_assignment(employee_id_fk) assignment, 
      'Department Manager' role FROM plantilla_positions pp 
        INNER JOIN department_positions dp ON dp.position_id_fk = pp._id 
        INNER JOIN departments  d ON d._id = dp.department_id_fk 
    WHERE position_title='Department Manager A' AND d.name = 'Human Resource Department')
    UNION (
      SELECT employeeFullName fullName,
      oicPosition position,
      oicOrgName assignment,
      'OIC-General Manager' role FROM officer_in_charge_view 
      WHERE oicPosition=CAST('OIC-Department Manager' AS BINARY) AND oicOrgName=CAST('Human Resource Department' AS BINARY)
    )
    )) as signatories WHERE signatories.fullName IS NOT NULL ;
    `,
    );
    const { effectivityDateMdy, effectivityDateDmy, ...rest } = data;
    return {
      data: {
        ...rest,
        effectivityDate: {
          monthDayYear: effectivityDateMdy,
          dayMonthYear: effectivityDateDmy,
        },
      },
      signatories,
    };
  }

  //private async
  async getCscForm33B(postingApplicantId: string) {
    const { applicantType } = (await this.entityRepository.query(`SELECT applicantType FROM posting_applicants_detailed_view WHERE postingApplicantId=?`, [postingApplicantId]))[0];

    let residentialAddress: PDSBasicResidentialAddress;
    let salutation = 'Mr.';
    let applicantSex = '';
    let applicantCivilStatus = '';

    if (applicantType === 'internal') {
      const { employeeId } = (await this.entityRepository.query('SELECT employee_id_fk employeeId FROM posting_applicants WHERE _id=?', [postingApplicantId]))[0];
      residentialAddress = await lastValueFrom(this.client.send({ msg: 'get_pds_residential_address' }, employeeId));
      const employeeInfo = await lastValueFrom(this.client.send({ msg: 'get_employee_info_pds' }, employeeId));
      const { employeeDetails, pdsPersonalInfo } = employeeInfo;
      applicantSex = employeeDetails.sex;
      applicantCivilStatus = pdsPersonalInfo.civilStatus;

    } else {
      const { externalApplicantId } = (
        await this.entityRepository.query('SELECT external_applicant_id_fk externalApplicantId FROM posting_applicants WHERE _id=?', [postingApplicantId])
      )[0];
      residentialAddress = await this.pdsBasicResidentialAddressService.entityRepository.findOne({ where: { externalApplicantId } });
      const applicantDetails = await this.pdsBasicPersonalInfoService.getApplicantBasicInfo(externalApplicantId);
      const { civilStatus, sex } = applicantDetails;
      applicantSex = sex;
      applicantCivilStatus = civilStatus;
    }
    if (applicantSex === 'Female') {
      if (applicantCivilStatus === 'Married' || applicantCivilStatus === 'Widowed') salutation = 'Mrs.';
      else salutation = 'Ms.';
    }

    const { houseNumber, street, subdivision, barangay, city, province, zipCode } = residentialAddress;

    const _houseNumber = houseNumber === 'N/A' ? '' : houseNumber.concat(', ');
    const _street = street === 'N/A' ? '' : street.concat(', ');
    const _subdivision = subdivision === 'N/A' ? '' : subdivision;

    const line1 = _houseNumber + _street + _subdivision;

    const line2 = barangay + ', ' + city;
    const data = (
      await this.entityRepository.query(
        `
    SELECT DISTINCT 
    CONCAT('${salutation}',' ',padv.applicantName) applicantName,
    vppv.positionTitle positionTitle,
    vppv.placeOfAssignment placeOfAssignment,
    '${line1}' addressLine1,
    '${line2}' addressLine2,
    CONCAT(UPPER(amount_in_words(get_salary_grade_amount(get_salary_grade_id(get_plantilla_salary_grade(vppv.positionId))))),' (Php ',FORMAT(get_salary_grade_amount(get_salary_grade_id(get_plantilla_salary_grade(vppv.positionId))),2),')') amountInWords,
    CONCAT(pdfb.item_number,' FY ',DATE_FORMAT(padv.effectivityDate,'%Y')) itemNumber,
    pdfb.appointment_type  appointmentType,
    vppv.salaryGradeLevel salaryGradeLevel,
    CONCAT(DATE_FORMAT(vppv.postingDate,'%M %d, %Y'),' to ',DATE_FORMAT(vppv.postingDeadline,'%M %d, %Y')) publicationPeriod, 
    pdfb.publication_mode publicationMode,
    DATE_FORMAT(padv.effectivityDate,'%M %d, %Y') dateOfSigning,
    DATE_FORMAT(padv.effectivityDate,'%M, %Y') effectivityDate,
    DATE_FORMAT(vpps.schedule, '%M %d, %Y') scheduleDate 
    FROM position_description_form_basic pdfb 
        INNER JOIN posting_applicants_detailed_view padv ON padv.postingApplicantId = pdfb.posting_applicants_id_fk
        INNER JOIN vacant_position_posting_publication_view vppv ON padv.vppId = vppv.vppId
        INNER JOIN plantilla_positions pp ON pp.item_number = pdfb.item_number
        INNER JOIN vpp_schedule vpps ON vpps.vacant_position_posting_id_fk = vppv.vppId
    WHERE padv.applicantStatus = 'Accepted' AND padv.postingApplicantId=? AND vpps.schedule_type='interview'; 
    `,
        [postingApplicantId],
      )
    )[0];

    const signatories = await this.entityRepository.query(
      `
      (SELECT fullName,position, assignment, role FROM ((SELECT
       get_employee_fullname(employee_id_fk) fullName,
       get_employee_position(employee_id_fk) position,
       get_employee_assignment(employee_id_fk) assignment, 
       IF(get_employee_fullname(employee_id_fk) IS NULL, NULL,'Appointing Authority') role FROM plantilla_positions 
     WHERE position_title='General Manager A') UNION (
       SELECT employeeFullName fullName,
       oicPosition position,
       oicOrgName assignment,
       'Appointing Authority' role FROM officer_in_charge_view 
       WHERE oicPosition=CAST('OIC-General Manager' as binary) AND oicOrgName=CAST('Office of the General Manager' AS BINARY)
     )) generalmanager WHERE fullName IS NOT NULL
       )
       UNION
       (
         SELECT
           get_employee_fullname(pp.employee_id_fk) fullName,
           get_employee_position(pp.employee_id_fk) position,
           get_employee_assignment(pp.employee_id_fk) assignment, 
           'Chairperson, HRMPSB' role FROM plantilla_positions pp 
             INNER JOIN vpp_psb vppp ON vppp.employee_id_fk = pp.employee_id_fk 
         WHERE vppp.psb_no = 1 AND vppp.vacant_position_posting_id_fk IN ( SELECT vacant_position_posting_id_fk FROM posting_applicants WHERE _id = ? )
       )
 
     `,
      [postingApplicantId, postingApplicantId],
    );

    const certificateOfAppointment = await this.entityRepository.query(
      `SELECT 
          pdfb.vice vice,
          pdfb.vice_type viceStatus,
          pdfb.field_page page,
          pdfb.nature_of_appointment natureOfAppointment,
          get_employee_fullname(pdfb.certified_by) fullName,
          get_employee_position_or_oic(pdfb.certified_by) position,
          get_employee_assignment_or_oic(pdfb.certified_by) assignment,
          date_format(pdfb.psb_duration_start_date, '%M %d, %Y') psbDurationStartDate
      FROM
          position_description_form_basic pdfb
          where pdfb.posting_applicants_id_fk = ?`,
      [postingApplicantId],
    );

    return {
      data: {
        ...data,
        vice: certificateOfAppointment[0].vice,
        viceStatus: certificateOfAppointment[0].viceStatus,
        page: certificateOfAppointment[0].page,
        natureOfAppointment: certificateOfAppointment[0].natureOfAppointment,
        psbDurationStartDate: certificateOfAppointment[0].psbDurationStartDate,
      },
      signatories: [
        ...signatories,
        {
          fullName: certificateOfAppointment[0].fullName,
          position: certificateOfAppointment[0].position,
          assignment: certificateOfAppointment[0].assignment,
          role: null,
        },
      ],
    };
  }

  async getCscForm2(yearMonth: string) {
    const data = await this.entityRepository.query(
      `
    SELECT DATE_FORMAT(padv.effectivityDate,'%m/%d/%Y') effectivityDate,
    padv.applicantLastName lastName, 
    padv.applicantFirstName firstName,
    padv.applicantNameExtension nameExtension, 
    padv.applicantMiddleName middleName,
    vppv.positionTitle positionTitle,
    pdfb.item_number itemNumber, 
    CONCAT(vppv.salaryGradeLevel,'-1') salaryGrade,
    FORMAT(get_salary_grade_amount(get_salary_grade_id(vppv.salaryGradeLevel)),2) monthlySalary,
    pdfb.employment_period_from employmentFrom, 
    pdfb.employment_period_to employmentTo, 
    pdfb.appointment_type natureOfAppointment,
    pp.nature_of_appointment employmentStatus,
    CONCAT(DATE_FORMAT(vppv.postingDate,'%m/%d/%Y'),' to ',DATE_FORMAT(vppv.postingDeadline,'%m/%d/%Y')) publicationPeriod, 
    pdfb.publication_mode publicationMode 
      FROM position_description_form_basic pdfb 
        INNER JOIN posting_applicants_detailed_view padv ON padv.postingApplicantId = pdfb.posting_applicants_id_fk 
        INNER JOIN vacant_position_posting_view vppv ON padv.vppId = vppv.vppId 
        INNER JOIN plantilla_positions pp ON pp._id=SUBSTRING_INDEX(vppv.positionId,',',1)
    WHERE padv.applicantStatus = 'Accepted' AND DATE_FORMAT(padv.effectivityDate,'%Y-%m')=?;`,
      [yearMonth],
    );

    const signatories1 = await this.entityRepository.query(
      `
       select *, 'Appointing Authority' role FROM ((SELECT
        get_employee_fullname(employee_id_fk) fullName,
        get_employee_position(employee_id_fk) position,
        get_employee_assignment(employee_id_fk) assignment 
         FROM plantilla_positions 
      WHERE position_title='General Manager A') UNION (
        SELECT employeeFullName fullName,
        oicPosition position,
        oicOrgName assignment 
        FROM officer_in_charge_view 
        WHERE oicPosition=CAST('OIC-General Manager' as binary) AND oicOrgName=CAST('Office of the General Manager' AS BINARY)
      ))  as signatory WHERE signatory.fullName IS NOT NULL;
    `,
    );

    const signatories2 = await this.entityRepository.query(`((
      SELECT get_employee_fullname(e._id) fullName,
             get_employee_position(e._id) position, 
             get_employee_assignment(e._id) assignment, 
             'HR Department Manager' role
       FROM plantilla_positions pp
         INNER JOIN department_positions dp ON pp._id = dp.position_id_fk 
         INNER JOIN departments d ON d._id = dp.department_id_fk
         INNER JOIN employees e ON e._id = pp.employee_id_fk
      WHERE cast(d.name AS binary) = 'Human Resource Department' AND cast(pp.position_title AS binary) = 'Department Manager A'
  )
  UNION
  (
     SELECT 
         employeeFullName fullName, 
         oicPosition position,
         oicOrgName assignment,
         'HR Department Manager' role
     FROM officer_in_charge_view 
     WHERE cast(oicPosition as binary) = 'OIC-Department Manager' AND  cast(oicOrgName as binary) ='Human Resource Department'
  ))
  UNION
  (
    SELECT get_employee_fullname(e._id) fullName,
           get_employee_position(e._id) position, 
           get_employee_assignment(e._id) assignment,
           get_employee_position(e._id) role 
       FROM plantilla_positions pp
         INNER JOIN office_positions op ON pp._id = op.position_id_fk 
         INNER JOIN office o ON o._id = op.office_id_fk
         INNER JOIN employees e ON e._id = pp.employee_id_fk
      WHERE cast(o.name AS binary) = 'Office of the Assistant General Manager for Administration'
       AND cast(pp.position_title AS binary) = 'Assistant General Manager'
  );`);

    return { data, signatories: [...signatories1].concat(signatories2[0]) };
  }
}
