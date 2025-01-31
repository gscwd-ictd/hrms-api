import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { getDateTimeNow } from 'src/global/utils/helper/date.helper';
import { Repository } from 'typeorm';
import { VppAcknowledgement, VppPsbDTO, VppPsbSwapDto, VppRecommendation } from './data/dtos/vpp-psb.dto';
import { VppPsb } from './data/entities/vpp-psb.entity';

@Injectable()
export class VppPsbService extends BaseEntityCrudService<VppPsb> {
  constructor(@InjectRepository(VppPsb) private readonly vppPsbRepository: Repository<VppPsb>) {
    super(vppPsbRepository);
  }

  async getPsbMembers(vppId: string) {
    try {
      return await this.entityRepository
        .createQueryBuilder('vppp')
        .select('vppp._id', '_id')
        .addSelect('vppp.employee_id_fk', 'employeeId')
        .addSelect('get_employee_fullname2(vppp.employee_id_fk)', 'fullName')
        .addSelect('vppp.psb_no', 'psbNo')
        .where(`vacant_position_posting_id_fk= :vppId AND get_employee_fullname2(vppp.employee_id_fk) IS NOT NULL ORDER BY vppp.psb_no ASC;`, { vppId })
        .getRawMany();
    } catch (error) {
      throw new HttpException('error', 500);
    }
  }

  async getNonPsbMembers(vppId: string) {
    try {
      //1975d823-be12-4fc8-a018-a80053b2c1cf this the hrmpsb ID
      const _nonPsbMembers = await this.entityRepository.query(
        `
        SELECT emp._id _id,get_employee_fullname2(emp._id) fullName, 
        get_employee_position(emp._id) position, 
        get_employee_assignment(emp._id) assignment 
         FROM employees emp 
           INNER JOIN committee_members cm ON cm.employee_id_fk = emp._id WHERE emp._id NOT IN (
          SELECT employee_id_fk FROM vpp_psb WHERE vacant_position_posting_id_fk = ? AND employee_id_fk IS NOT NULL 
        ) AND cm.committee_id_fk = '1975d823-be12-4fc8-a018-a80053b2c1cf';`,
        [vppId],
      );

      const nonPsbMembers = await Promise.all(
        _nonPsbMembers.map(async (nonPsbMember) => {
          return { label: nonPsbMember.fullName, value: { employeeId: nonPsbMember._id, fullName: nonPsbMember.fullName } };
        }),
      );

      return nonPsbMembers;
    } catch (error) {
      throw new HttpException('error', 500);
    }
  }

  async swapPsb(vppPsbSwapDto: VppPsbSwapDto) {
    try {
      const { employeeId, psbNo, vppId } = vppPsbSwapDto;
      const updateResult = await this.entityRepository
        .createQueryBuilder()
        .update(VppPsb)
        .set({ employeeId, acknowledgedSchedule: true })
        .where('vacant_position_posting_id_fk = :vppId AND psb_no= :psbNo', { vppId, psbNo })
        .execute();

      if (updateResult.affected > 0) return vppPsbSwapDto;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async assignedPsbMember(vppId: string, vppPsbDTO: VppPsbDTO[]) {
    try {
      const result = await Promise.all(
        vppPsbDTO.map(async (vppPsb) => {
          return await this.saveEntity({
            ...vppPsb,
            done: true,
            vppId,
          });
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  /**
   * @audience Employee Portal
   * @param vppId
   * @param employeeId
   * @returns employeeId, vppId, acknowledgedSchedule
   */
  async psbAcknowledgeSchedule(vppId: string, employeeId: string, action: string, vppAcknowledgement: VppAcknowledgement) {
    try {
      const acknowledgedSchedule = true;
      if (action === 'accept') {
        const updateVppPsb = await this.entityRepository
          .createQueryBuilder()
          .update()
          .set({ acknowledgedSchedule, declinedSchedule: false, declineReason: null, dateAcknowledged: getDateTimeNow() })
          .where('employee_id_fk=:employeeId AND vacant_position_posting_id_fk=:vppId', { employeeId, vppId })
          .execute();
        if (updateVppPsb.affected > 0) return { employeeId, vppId, acknowledgedSchedule, dateAcknowledged: getDateTimeNow() };
      } else if (action === 'decline') {
        const declinedSchedule = true;
        const updateVppPsb = await this.entityRepository
          .createQueryBuilder()
          .update()
          .set({
            acknowledgedSchedule: false,
            declinedSchedule,
            declineReason: vppAcknowledgement.declineReason,
            dateAcknowledged: getDateTimeNow(),
          })
          .where('employee_id_fk=:employeeId AND vacant_position_posting_id_fk=:vppId', { employeeId, vppId })
          .execute();
        if (updateVppPsb.affected > 0) return { employeeId, vppId, declinedSchedule, dateAcknowledged: getDateTimeNow(), declineReason: vppAcknowledgement.declineReason };
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async setIsDone(vppId: string, employeeId: string, vppRecommendation: VppRecommendation) {
    try {
      const done = true;
      const updateVppPsb = await this.entityRepository
        .createQueryBuilder()
        .update()
        .set({ done, recommendation: vppRecommendation.recommendation, recommendationDate: getDateTimeNow() })
        .where('employee_id_fk=:employeeId AND vacant_position_posting_id_fk=:vppId', { employeeId, vppId })
        .execute();
      if (updateVppPsb.affected > 0) return { employeeId, vppId, done };
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getUnacknowledgedVppSchedules(psbEmployeeId: string) {
    const vppUnacknowledgedSchedules = await this.entityRepository.query(
      `
    SELECT vpppv.vppId vppId,
    vpppv.positionId positionId,
    vpppv.positionTitle positionTitle, 
    vpppv.numberOfPositions numberOfPositions, 
    get_position_assignment(vpppv.positionId) assignment,
    DATE_FORMAT(vpps.schedule, '%Y-%m-%d %H:%i:%s') 'schedule', 
    venue,
    vppp.acknowledged_schedule acknowledgedSchedule,
    vppp.declined_schedule declinedSchedule,
    vppp.decline_reason declineReason,
    DATE_FORMAT(vppp.date_acknowledged, '%Y-%m-%d %H:%i:%s') dateAcknowledged
    FROM vpp_schedule vpps 
        INNER JOIN vacant_position_posting vpp ON vpp._id = vpps.vacant_position_posting_id_fk 
        INNER JOIN vpp_psb vppp ON vppp.vacant_position_posting_id_fk = vpp._id
        INNER JOIN vacant_position_posting_publication_view vpppv ON vpppv.vppId = vpp._id
    WHERE vppp.employee_id_fk = ? AND vpps.schedule_type = 'interview';
    `,
      [psbEmployeeId],
    );

    const unacknowledgedScheduleDetails = await Promise.all(
      vppUnacknowledgedSchedules.map(async (vppUnacknowledgedSchedule) => {
        const psbMembers = await this.entityRepository.query(
          `SELECT 
       psb_no psbNo, 
       get_employee_fullname(employee_id_fk) fullName,
       get_employee_position(employee_id_fk) employeePosition, 
       get_employee_assignment(employee_id_fk) assignment, 
       acknowledged_schedule acknowledgedSchedule 
 FROM vpp_psb WHERE vacant_position_posting_id_fk = ? AND employee_id_fk IS NOT NULL ORDER BY psb_no ASC;`,
          [vppUnacknowledgedSchedule.vppId],
        );
        return { details: vppUnacknowledgedSchedule, psbMembers };
      }),
    );

    return unacknowledgedScheduleDetails;
  }

  async getAcknowledgedPSBMembersPerPosting(vppId: string) {
    try {
      return await this.entityRepository.query(
        `SELECT 
            psb_no psbNo, 
            get_employee_fullname(employee_id_fk) fullName,
            get_employee_position(employee_id_fk) employeePosition, 
            get_employee_assignment(employee_id_fk) assignment, 
            acknowledged_schedule acknowledgedSchedule 
         FROM vpp_psb WHERE vacant_position_posting_id_fk = ? AND acknowledged_schedule = 1`,
        [vppId],
      );
    } catch (error) { }
  }
}
