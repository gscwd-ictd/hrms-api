import { PlantillaViewService } from './../plantilla-positions/views/plantilla-view/plantilla-view.service';
import { ApplicantStatus } from './sub-modules/applicants/utils/enums/applicant-status.enum';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { VacantPositionPostingDTO, VppEffectivityDateDTO } from './data/dtos/vacant-positions-posting.dto';
import { VacantPositionPosting } from './data/entities/vacant-position-posting.entity';
import { VacantPositionPostingViewService } from './data/views/vacant-position-posting-view/vacant-position-posting-view.service';
import { PostingApplicantsDetailedViewService } from './sub-modules/applicants/data/views/posting-applicants-detailed-view/posting-applicants-detailed-view.service';
import { VppInterviewRatingService } from './sub-modules/vpp-interview-rating/vpp-interview-rating.service';
import { VppPsbApplicantsService } from './sub-modules/vpp-psb-applicants/vpp-psb-applicants.service';
import { VppPsbService } from './sub-modules/vpp-psb/vpp-psb.service';
import { VppScheduleService } from './sub-modules/vpp-schedule/vpp-schedule.service';
import { PostingStatus } from './utils/enums/posting-status.enum';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class VacantPositionPostingService extends BaseEntityCrudService<VacantPositionPosting> {
  constructor(
    @InjectRepository(VacantPositionPosting)
    private readonly vacantPositionRepository: Repository<VacantPositionPosting>,
    public vppScheduleService: VppScheduleService,
    public vppPsbService: VppPsbService,
    private vppViewService: VacantPositionPostingViewService,
    private postingApplicantDetailsViewService: PostingApplicantsDetailedViewService,
    private vppInterviewRatingService: VppInterviewRatingService,
    private vppPsbApplicantsService: VppPsbApplicantsService,
    private readonly plantillaViewService: PlantillaViewService,
  ) {
    super(vacantPositionRepository);
  }

  async getAllOpenPostings() {
    try {
      return await this.vppViewService.entityRepository.find({ where: { postingStatus: 'Open for application' } });
    } catch (error) {
      throw new HttpException('error', 500);
    }
  }

  async getVppView(prfId: string) {
    return await this.vppViewService.getPosting(prfId);
  }

  async applicantDetailsPerPosting(vppId: string, applicantId: string) {
    return await this.entityRepository.query(
      'SELECT applicantId AS _id, fullName, firstName, middleName, lastName, nameExt, applicantStatus, internal FROM posting_applicants_view WHERE vppId=? AND applicantId = ?',
      [vppId, applicantId],
    );
  }

  async applicantDetails(vppId: string) {
    return await this.entityRepository.query(
      'SELECT postingApplicantId as _id,applicantId, applicantName2 as fullName, applicantStatus, applicantType FROM posting_applicants_detailed_view WHERE vppId=? ORDER BY applicantName2 ASC',
      [vppId],
    );
  }

  async getPostingList(postingDate: string) {
    const postingDateQuery = postingDate ? ' vpp.posting_date = :postingDate ' : '';
    const postings = await this.entityRepository
      .createQueryBuilder('vpp')
      .select('vpp._id', 'vacantPositionPostingId')
      .addSelect("DATE_FORMAT(vpp.posting_date, '%Y-%m-%d')", 'postingDate')
      .addSelect("DATE_FORMAT(vpp.posting_deadline, '%Y-%m-%d')", 'postingDeadline')
      .addSelect('posting_status', 'postingStatus')
      .where(postingDateQuery, { postingDate })
      .orderBy('postingDate', 'DESC')
      .getRawMany();

    const postingList = await Promise.all(
      postings.map(async (posting) => {
        const positionDetails = await this.entityRepository
          .createQueryBuilder('vpp')
          .select('pp.position_title', 'positionTitle')
          .distinct(true)
          .addSelect('sg.salary_grade', 'salaryGrade')
          .innerJoin('prf_positions', 'prfp', 'prfp._id = vpp.prf_positions_id_fk')
          .innerJoin('plantilla_positions', 'pp', 'prfp.position_id_fk = pp._id')
          .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
          .where('vpp._id = :vppId', { vppId: posting.vacantPositionPostingId })
          .getRawOne();

        const positionCount = await this.entityRepository
          .createQueryBuilder('vpp')
          .select('count(pp.position_title)', 'numberOfVacancy')
          .distinct(true)
          .innerJoin('prf_positions', 'prfp', 'prfp._id = vpp.prf_positions_id_fk')
          .innerJoin('plantilla_positions', 'pp', 'prfp.position_id_fk = pp._id')
          .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
          .where('vpp._id = :vppId', { vppId: posting.vacantPositionPostingId })
          .getRawOne();

        const numberOfApplicants = await this.entityRepository
          .createQueryBuilder('vpp')
          .select('count(pav.applicantId)', 'numberOfApplicants')
          .innerJoin('posting_applicants_view', 'pav', 'pav.vppId = vpp._id')
          .where('vpp._id = :vppId', { vppId: posting.vacantPositionPostingId })
          .getRawOne();

        return {
          vacantPositionPostingId: posting.vacantPositionPostingId,
          postingStatus: posting.postingStatus,
          postingDate: posting.postingDate,
          postingDeadline: posting.postingDeadline,
          ...positionDetails,
          ...positionCount,
          ...numberOfApplicants,
        };
      }),
    );
    return postingList;
  }

  async getSchedules(vppId: string) {
    const interview = await this.vppScheduleService.entityRepository
      .createQueryBuilder('vs')
      .select('_id')
      .addSelect("DATE_FORMAT(schedule,'%Y-%m-%d')", 'date')
      .addSelect("DATE_FORMAT(schedule,'%h:%i %p')", 'time')
      .addSelect('venue', 'venue')
      .where("vacant_position_posting_id_fk = :vppId AND schedule_type='interview'", { vppId })
      .getRawOne();

    const examination = await this.vppScheduleService.entityRepository
      .createQueryBuilder('vs')
      .select('_id')
      .addSelect("DATE_FORMAT(schedule,'%Y-%m-%d')", 'date')
      .addSelect("DATE_FORMAT(schedule,'%h:%i %p')", 'time')
      .addSelect('venue', 'venue')
      .where("vacant_position_posting_id_fk = :vppId AND schedule_type='examination'", { vppId })
      .getRawOne();

    return {
      vppId,
      interview: {
        _id: interview._id,
        schedule: { date: interview.date, time: interview.time, venue: interview.venue },
      },
      examination: {
        _id: examination._id,
        schedule: {
          date: examination.date,
          time: examination.time,
          venue: examination.venue,
        },
      },
    };
  }

  async getSchedulePsb(vppScheduleId: string) {
    return await this.vppPsbService.entityRepository
      .createQueryBuilder('vsp')
      .select('vsp.psb_no', 'psbNo')
      .addSelect('emp._id', 'employeeId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('get_employee_fullname(emp._id)', 'fullName')
      .addSelect('emp.first_name', 'firstName')
      .addSelect('emp.middle_name', 'middleName')
      .addSelect('emp.last_name', 'lastName')
      .addSelect('emp.name_extension', 'nameExt')
      .addSelect('pp.position_title', 'positionTitle')
      .addSelect('get_employee_assignment_id(emp._id)', 'id')
      .addSelect('get_employee_assignment(emp._id)', 'name')
      .innerJoin('committee_members', 'cm', 'cm._id = vsp.committee_member_id_fk')
      .innerJoin('employees', 'emp', 'emp._id = cm.employee_id_fk')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('vpp_schedule_id_fk = :vppScheduleId', { vppScheduleId })
      .getRawMany();
  }

  async getSinglePostingForPsb(employeeId: string, vppId: string) {
    try {
      const posting = await this.entityRepository
        .createQueryBuilder('vpp')
        .select('vpp._id', 'vppId')
        .distinct(true)
        .addSelect('vp.done', 'isDone')
        .addSelect('prfd.with_exam', 'withExam')
        .addSelect('sg.salary_grade', 'salaryGrade')
        .innerJoin('vpp_psb', 'vp', 'vp.vacant_position_posting_id_fk = vpp._id')
        .innerJoin('vpp_schedule', 'vs', 'vs.vacant_position_posting_id_fk = vpp._id')
        .innerJoin('vpp_positions', 'vppp', 'vpp._id=vppp.vacant_position_posting_id_fk')
        .innerJoin('prf_positions', 'prfp', 'prfp.position_id_fk = vppp.prf_positions_positions_id_fk')
        .innerJoin('prf_details', 'prfd', 'prfd._id = prfp.prf_details_id_fk')
        .innerJoin('plantilla_positions', 'pp', 'pp._id = vppp.prf_positions_positions_id_fk')
        .innerJoin('salary_grade', 'sg', 'pp.salary_grade_id_fk = sg._id')
        .where('vp.employee_id_fk = :employeeId AND vpp._id = :vppId', { employeeId, vppId })
        .getRawOne();
      return posting;
    } catch (error) {
      throw new HttpException('', 500);
    }
  }

  async getPostingsForPsb(employeeId: string) {
    try {
      const isPSB = (await this.entityRepository.query('SELECT IF(count(_id)>0,true,false) isPSB FROM committee_members WHERE employee_id_fk = ?', [employeeId]))[0].isPSB;

      if (isPSB < 1) throw new HttpException('Not a member of HRM PSB', HttpStatus.UNAUTHORIZED);
      const posting = await this.entityRepository
        .createQueryBuilder('vpp')
        .select('vpp._id', 'vppId')
        .distinct(true)
        .addSelect('has_pending_acknowledgement(vpp._id)', 'hasPendingAcknowledgement')
        .addSelect('vpp.posting_date', 'postingDate')
        .addSelect('vpp.posting_deadline', 'postingDeadline')
        .addSelect("concat('PSB ',vp.psb_no)", 'role')
        .addSelect('vpp.posting_status', 'postingStatus')
        .addSelect('vs.schedule', 'schedule')
        .addSelect('prfd.with_exam', 'withExam')
        .addSelect('vp.done', 'isDone')
        .addSelect('vs.schedule_type', 'scheduleType')
        .addSelect('vs.venue', 'venue')
        .addSelect('group_concat( distinct pp.item_number ORDER BY pp.item_number ASC)', 'itemNumber')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('get_plantilla_salary_grade(pp._id)', 'salaryGrade')
        .addSelect(`vp.declined_schedule`, 'declinedSchedule')
        .addSelect(`get_position_assignment(pp._id)`, 'assignment')
        .innerJoin('vpp_psb', 'vp', 'vp.vacant_position_posting_id_fk = vpp._id')
        .innerJoin('vpp_schedule', 'vs', 'vs.vacant_position_posting_id_fk = vpp._id')
        .innerJoin('vpp_positions', 'vppp', 'vpp._id=vppp.vacant_position_posting_id_fk')
        .innerJoin('prf_positions', 'prfp', 'prfp.position_id_fk = vppp.prf_positions_positions_id_fk')
        .innerJoin('prf_details', 'prfd', 'prfd._id = prfp.prf_details_id_fk')
        .innerJoin('plantilla_positions', 'pp', 'pp._id = vppp.prf_positions_positions_id_fk')
        .where(`vp.employee_id_fk = :employeeId AND vs.schedule_type='interview'`, { employeeId })
        .orderBy('postingDate', 'DESC')
        .groupBy(
          `
          vpp._id,
          get_employee_fullname2(prfd.employee_id_fk),
          has_pending_acknowledgement(vpp._id),
          vpp.posting_date,
          vpp.posting_deadline,
          vpp.posting_status,
          vs.schedule,
          vp.done,
          vs.schedule_type,
          vs.venue,
          vp.psb_no,
          prfd.with_exam,
          pp.position_title,
          vp.declined_schedule,
          get_plantilla_salary_grade(pp._id),
          get_position_assignment(pp._id)  
        `,
        )
        .getRawMany();
      return posting;
    } catch (error) {
      if (error.status === 401) throw new HttpException(error.message, error.status);
    }
  }

  async getRequestingEntityRequestedVpp(employeeId: string) {
    const publication = await this.entityRepository.query(
      `
        SELECT vppId, postingDate, postingDeadline, positionId, positionTitle, 
        itemNumber, numberOfPositions, salaryGradeLevel, salaryGrade, annualSalary,
        education, training, eligibility, experience, placeOfAssignment,occupationName, 
        prfNo, prfId, withExam, postingStatus FROM vacant_position_posting_view vppv
        INNER JOIN prf_details prfd ON prfd._id = vppv.prfId 
        WHERE vppv.prfId = prfd._id AND prfd.employee_id_fk = ?
        AND vppv.postingStatus = 'Requesting entity selection';
    `,
      [employeeId],
    );
    //console.table(publication);
    return publication;
  }

  async getVppsForAppointingAuthoritySelection() {
    const publication = await this.entityRepository.query(
      `
        SELECT vppId, postingDate, postingDeadline, positionId, positionTitle, 
        itemNumber, numberOfPositions, salaryGradeLevel, salaryGrade, annualSalary,
        education, training, eligibility, experience, placeOfAssignment,occupationName, 
        prfNo, prfId, withExam, postingStatus FROM vacant_position_posting_view vppv
        WHERE vppv.postingStatus = 'Appointing authority selection';
    `,
    );
    //console.table(publication);
    return publication;
  }

  async updatePosting(_id: string, postingDTO: VacantPositionPostingDTO) {
    try {
      const vpp = await this.vppViewService.entityRepository.findOne({ vppId: _id });

      if (vpp.postingStatus === PostingStatus.CLOSED_FOR_APPLICATION && postingDTO.postingStatus === PostingStatus.CLOSED_FOR_APPLICATION)
        throw new HttpException('Posting is already closed.', HttpStatus.FORBIDDEN);

      const positionId = vpp.positionId.split(',')[0];

      const { assignedPSBMembers, ...rest } = postingDTO;

      const updatedVpp = await this.updateEntity({ _id, ...rest });

      if (updatedVpp.postingStatus === PostingStatus.CLOSED_FOR_APPLICATION) {
        const salaryGrade = parseInt((await this.entityRepository.query(`SELECT get_plantilla_salary_grade(?) salaryGrade;`, [positionId]))[0].salaryGrade);

        const totalRequiredPSBMembers = this.getRequiredTotalPsbMember(salaryGrade);
        const nullValuedPSBMembers = totalRequiredPSBMembers - assignedPSBMembers.length;

        //1.0 Add assigned psb members to the posting
        const newPsbMembers = await Promise.all(
          assignedPSBMembers.map(async (psbMember) => {
            return await this.vppPsbService.saveEntity({
              vppId: _id,
              employeeId: psbMember.employeeId,
              psbNo: psbMember.psbNo,
              done: false,
            });
          }),
        );

        const nullPsbs = [];
        for (let i = 0; i < nullValuedPSBMembers; i++) {
          //1. query vacant psbNos on the posting
          const psbNo = (await this.entityRepository.query('SELECT generate_available_psb_no(?,?) psbNo;', [_id, totalRequiredPSBMembers]))[0].psbNo;
          nullPsbs.push(
            await this.vppPsbService.saveEntity({
              vppId: _id,
              done: false,
              psbNo,
            }),
          );
        }

        //insert to vpp interview rating per psb-member per employee
        //1.1 get assigned PSB Members of the specific Posting
        const psbMembers = await this.vppPsbService.entityRepository.find({ where: { vppId: _id } });

        //2. get applicants of the specific posting;
        const applicants = await this.postingApplicantDetailsViewService.entityRepository.find({ where: { vppId: _id, applicantStatus: ApplicantStatus.QUALIFIED } });

        //3. get pcplIds of the vppPosition;
        const pcplIds = await this.entityRepository.query(
          `SELECT pcpl._id pcplId FROM position_competency_proficiency_level pcpl 
              INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk  
          WHERE og.position_id_fk = ?`,
          [positionId],
        );
        await Promise.all(
          psbMembers.map(async (psbMember) => {
            const vppMemberApplicant = await Promise.all(
              applicants.map(async (applicant) => {
                //4.0 save to VppPsbApplicants
                const vppPsbApplicants = await this.vppPsbApplicantsService.saveEntity({
                  vppPsbId: psbMember._id,
                  postingApplicantsId: applicant.postingApplicantId,
                  remarks: '',
                  examResult: 0,
                  interviewed: false,
                  examTaken: false,
                });
                //4.1 Save to VPPInterviewRating
                const vppInterviewRatings = await Promise.all(
                  pcplIds.map(async (pcplIdItem) => {
                    return await this.vppInterviewRatingService.saveEntity({
                      pcplId: pcplIdItem.pcplId,
                      rating: 0,
                      postingApplicantId: applicant.postingApplicantId,
                      vppPsbId: psbMember._id,
                    });
                  }),
                );
                return vppInterviewRatings;
              }),
            );
            return vppMemberApplicant;
          }),
        );
      }
      return {
        vppId: _id,
        ...postingDTO,
      };
    } catch (error) {
      if (error.status !== 403) throw new HttpException(error, 500);

      throw new HttpException(error, 403);
    }
  }

  async getCalendarSchedule() {
    const currmonth = new Date().getMonth() + 1;
    const prevmonth = currmonth > 1 ? currmonth - 1 : 1;
    const nextmonth = currmonth < 12 ? currmonth + 1 : 12;

    const _events = await this.vppScheduleService.entityRepository
      .createQueryBuilder('vs')
      .select('vpp._id', 'id')
      .addSelect('vs.venue', 'venue')
      .distinct(true)
      .addSelect('pp.position_title', 'title')
      .addSelect('group_concat(distinct pp.item_number order by pp.item_number ASC)', 'itemNumber')
      .addSelect('vs.schedule_type', 'scheduleType')
      .addSelect("DATE_FORMAT(vs.schedule,'%Y-%m-%d %H:%i:%s')", 'start')
      .innerJoin('vacant_position_posting', 'vpp', 'vs.vacant_position_posting_id_fk = vpp._id')
      .innerJoin('vpp_positions', 'vppp', 'vppp.vacant_position_posting_id_fk = vpp._id')
      .innerJoin('prf_positions', 'prf_pos', 'prf_pos.position_id_fk = vppp.prf_positions_positions_id_fk')
      .innerJoin('plantilla_positions', 'pp', 'pp._id = prf_pos.position_id_fk')
      .where("DATE_FORMAT(schedule,'%m') <= :nextmonth AND DATE_FORMAT(schedule,'%m') >= :prevmonth AND DATE_FORMAT(schedule,'%Y') = year(now())", { nextmonth, prevmonth })
      .orderBy('start', 'ASC')
      .groupBy(`vpp._id,vs.venue,pp.position_title,vs.schedule_type, DATE_FORMAT(vs.schedule,'%Y-%m-%d %H:%i:%s')`)
      .getRawMany();

    const events = await Promise.all(
      _events.map(async (event) => {
        const psbMembers = await this.vppPsbService.entityRepository
          .createQueryBuilder('vp')
          .select("concat('PSB ', vp.psb_no)", 'role')
          .addSelect('get_employee_fullname(emp._id)', 'fullName')
          .distinct(true)
          .innerJoin('committee_members', 'cm', 'cm.employee_id_fk = vp.employee_id_fk')
          .innerJoin('employees', 'emp', 'emp._id = cm.employee_id_fk')
          .innerJoin('vacant_position_posting', 'vpp', 'vpp._id = vp.vacant_position_posting_id_fk')
          .where('vpp._id = :vppId', { vppId: event.id })
          .orderBy('role', 'ASC')
          .getRawMany();

        const numberOfApplicants = await this.entityRepository
          .createQueryBuilder('vpp')
          .select('count(pav.applicantId)', 'numberOfApplicants')
          .innerJoin('posting_applicants_view', 'pav', 'pav.vppId = vpp._id')
          .where('vpp._id = :vppId', { vppId: event.id })
          .getRawOne();

        return { ...event, psbMembers, numberOfApplicants: numberOfApplicants.numberOfApplicants };
      }),
    );
    return events;
  }

  async setVppEffectivityDate(vppId: string, vppEffectivityDateDTO: VppEffectivityDateDTO) {
    try {
      const { effectivityDate } = vppEffectivityDateDTO;
      //get vppIds;
      return await this.updateEntity({ _id: vppId, effectivityDate });
    } catch (error) {}
  }

  //! REFACTOR
  async getVppCompetencies(vppId: string) {
    try {
      const core = await this.entityRepository.query(
        `
        SELECT DISTINCT cm.code, cm.name, p.level FROM competency_model cm 
          INNER JOIN proficiency p ON p.competency_id_fk = cm._id
          INNER JOIN domain d ON d._id = cm.domain_id_fk
          INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
          INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
          INNER JOIN vacant_position_posting_publication_view vpppv ON vpppv.positionId = og.position_id_fk
        WHERE vpppv.vppId=? AND d.type='core';
      `,
        [vppId],
      );

      const functional = await this.entityRepository.query(
        `
      SELECT DISTINCT cm.code, cm.name, p.level FROM competency_model cm 
        INNER JOIN proficiency p ON p.competency_id_fk = cm._id
        INNER JOIN domain d ON d._id = cm.domain_id_fk
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
        INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
        INNER JOIN vacant_position_posting_publication_view vpppv ON vpppv.positionId = og.position_id_fk
      WHERE vpppv.vppId=? AND (d.type='Functional' OR d.type='Cross-Cutting Functional');`,
        [vppId],
      );

      const managerial = await this.entityRepository.query(
        `
      SELECT DISTINCT cm.code, cm.name, p.level FROM competency_model cm 
        INNER JOIN proficiency p ON p.competency_id_fk = cm._id
        INNER JOIN domain d ON d._id = cm.domain_id_fk
        INNER JOIN position_competency_proficiency_level pcpl ON pcpl.proficiency_id_fk = p._id
        INNER JOIN occupational_group og ON og._id = pcpl.occupational_group_id_fk
        INNER JOIN vacant_position_posting_publication_view vpppv ON vpppv.positionId = og.position_id_fk
      WHERE vpppv.vppId=? AND (d.type='Leadership/Managerial');`,
        [vppId],
      );

      return { core, functional, managerial };
    } catch (error) {}
  }

  /* ----- */
  async getVppJDCompetenciesById(vppId: string) {
    //1. get position Id from vppID
    const positionId = (
      await this.entityRepository.query(`SELECT substring_index(vppv.positionId,',',1) positionId from vacant_position_posting_view vppv WHERE vppv.vppId = ?`, [vppId])
    )[0].positionId;
    //const positionDescription =
    const dutiesAndResponsibilities = await this.plantillaViewService.getPositionDutiesAndResponsibilities(positionId);
    const positionDescription = await this.plantillaViewService.getPositionDescription(positionId);
    return { ...positionDescription, dutiesAndResponsibilities };
  }

  async getVppItemNumbers(vppId: string) {
    try {
      return await this.plantillaViewService.entityRepository.query(
        `
      SELECT itemNumber,positionId FROM vacant_position_posting_publication_view vpppv
      INNER JOIN plantilla_positions pp ON pp._id = vpppv.positionId
     WHERE vppId = ? AND pp.employee_id_fk IS NULL AND pp.item_number NOT IN (
       SELECT item_number FROM position_description_form_basic
     );`,
        [vppId],
      );
    } catch (error) {}
  }

  async getPsbDetails(vppId: string) {
    try {
      const { noOfApplicants } = (await this.entityRepository.query(`SELECT count(vppId) noOfApplicants FROM posting_applicants_detailed_view WHERE vppId=?`, [vppId]))[0];
      const psbMembers = await this.entityRepository.query(
        `
        SELECT get_employee_fullname(employee_id_fk) fullName, 
        concat('PSB ',psb_no) role, 
        get_acknowledgement_status(_id) psbMemberStatus FROM vpp_psb WHERE vacant_position_posting_id_fk=? AND employee_id_fk IS NOT NULL ORDER BY psb_no ASC;`,
        [vppId],
      );
      const examSchedule = (
        await this.entityRepository.query(
          `SELECT DATE_FORMAT(vs.schedule,'%Y-%m-%d %h:%i %p') schedule, venue FROM vpp_schedule vs WHERE vacant_position_posting_id_fk=? AND schedule_type='examination'`,
          [vppId],
        )
      )[0];
      const interviewSchedule = (
        await this.entityRepository.query(
          `SELECT DATE_FORMAT(vs.schedule,'%Y-%m-%d %h:%i %p') schedule, venue FROM vpp_schedule vs WHERE vacant_position_posting_id_fk=? AND schedule_type='interview'`,
          [vppId],
        )
      )[0];

      return { id: vppId, noOfApplicants, psbMembers, schedule: { exam: examSchedule, interview: interviewSchedule } };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getEmployeeIdByPostingApplicantId(postingApplicantId: string) {
    try {
      const employeeId = (await this.entityRepository.query(`SELECT employee_id_fk employeeId FROM posting_applicants WHERE _id = ?`, [postingApplicantId]))[0].employeeId;
      return employeeId;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  private getRequiredTotalPsbMember(salaryGrade: number) {
    if (salaryGrade < 24) return 6;
    else if (salaryGrade === 24) return 8;
    else if (salaryGrade >= 26) return 7;
  }
}
