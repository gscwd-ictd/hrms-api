import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PlantillaPositionsService } from 'src/core/plantilla-positions/plantilla-positions.service';
import { getManager, Repository } from 'typeorm';
import { PrfTrailService } from '../document-tracking/prf/trail/prf-trail.service';
import { PlantillaViewService } from '../plantilla-positions/views/plantilla-view/plantilla-view.service';
import { PrfDetailsDTO, UpdatePrfDetailsDto } from './data/dto/prf-details.dto';
import { PrfDetails } from './data/entity/prf-details.entity';
import { PrfPositionsService } from './prf-positions/prf-positions.service';
import { PrfStatus } from './utils/enums/prf-status.enum';

@Injectable()
export class PrfDetailsService extends BaseEntityCrudService<PrfDetails> {
  constructor(
    @InjectRepository(PrfDetails) prfDetailsRepository: Repository<PrfDetails>,
    private prfPositionsService: PrfPositionsService,
    private plantillaPositionsService: PlantillaPositionsService,
    private plantillaViewService: PlantillaViewService,
    private prfTrailService: PrfTrailService,
  ) {
    super(prfDetailsRepository);
  }

  async addPrf(prfDetailsDto: PrfDetailsDTO) {
    try {
      let prf = {};
      let prfTrail = {};
      const gm = (
        await this.plantillaPositionsService.entityRepository.query(`
      (SELECT get_employee_fullname(emp._id) fullName FROM 
      plantilla_positions pp INNER JOIN employees emp ON emp._id = pp.employee_id_fk 
      WHERE pp.position_title = 'General Manager A')
      UNION
      (SELECT oicv.employeeFullName fullName FROM officer_in_charge_view oicv WHERE oicPosition=cast('OIC-General Manager' AS BINARY));`)
      )[0];

      const prfNo = (await this.entityRepository.query('SELECT generate_prf_no() as prfNo;'))[0].prfNo;

      await getManager().transaction(async (transactionEntityManager) => {
        const { prfPositions, ...prfDetailsAlone } = prfDetailsDto;
        const prfDetails = await transactionEntityManager.save(this.createEntity({ for: gm.fullName, prfNo, ...prfDetailsAlone }));

        //let _prfPositions = [];
        const _prfPositions = await Promise.all(
          prfPositions.map(async (prfPosition) => {
            return await transactionEntityManager.save(this.prfPositionsService.createEntity({ prfDetailsId: prfDetails._id, ...prfPosition }));
          }),
        );

        //generate prf trail

        //scenarios
        //1. division_manager
        //1.1 w/ deptmanager
        //1.2 w/o deptmanager
        //2. dept_manager
        //3. office_head

        const positionId = await this.plantillaPositionsService.entityRepository.findOne({ select: ['_id'], where: { employeeId: prfDetails.employeeId } });

        const prfTrailObject = (await this.entityRepository.query('CALL sp_set_prf_trail_init_status2(?)', [prfDetails.employeeId]))[0][0];

        const { divisionStatus, departmentStatus, agmStatus, adminStatus, gmStatus, boardStatus } = prfTrailObject;

        const updatedAts = await this.generateUpdatedAt(prfTrailObject);

        prfTrail = await transactionEntityManager.save(
          this.prfTrailService.createEntity({ prfDetailsId: prfDetails._id, ...updatedAts, divisionStatus, departmentStatus, agmStatus, adminStatus, gmStatus, boardStatus }),
        );

        prf = { prfDetails: { ...prfDetails, prfPositions: _prfPositions } };
      });
      return { prf, prfTrail };
    } catch (error) {
      if (error.code == 'ER_DUP_ENTRY') throw new HttpException('One or more positions were already been requested.', HttpStatus.NOT_ACCEPTABLE);
      throw new HttpException('Error adding PRF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateUpdatedAt(prfTrailObject: { divisionStatus: string; departmentStatus: string; agmStatus: string; adminStatus: string; gmStatus: string; boardStatus: string }) {
    const { divisionStatus, departmentStatus, adminStatus, agmStatus, gmStatus } = prfTrailObject;
    const divisionStatusUpdatedAt = divisionStatus === 'Sent' ? new Date() : null;
    const departmentStatusUpdatedAt = departmentStatus === 'Sent' ? new Date() : null;
    const agmStatusUpdatedAt = agmStatus === 'Sent' ? new Date() : null;
    const gmStatusUpdatedAt = gmStatus === 'Sent' ? new Date() : null;
    return { divisionStatusUpdatedAt, departmentStatusUpdatedAt, agmStatusUpdatedAt, gmStatusUpdatedAt };
  }

  async clearPrfs() {
    return await this.entityRepository.query('CALL sp_delete_10_15_prf();');
  }

  async getAllPrfs() {
    try {
      const prf = await this.entityRepository
        .createQueryBuilder('prf')
        .select('prf._id', '_id')
        .addSelect('prf.for', 'for')
        .addSelect('prf.prf_no', 'prfNo')
        .addSelect('prf.withExam', 'withExam')
        .addSelect('prf.status', 'status')
        .addSelect('prf.dateRequested', 'dateRequested')
        .addSelect('prf.date_needed', 'dateNeeded')
        .addSelect('get_employee_fullname(emp._id)', 'from')
        .innerJoin('employees', 'emp', 'emp._id = prf.employee_id_fk')
        .orderBy('prf.prf_no', 'DESC')
        .getRawMany();

      return prf;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getPrfsByEmpId(employeeId: string, status: string) {
    let _prfDetails: PrfDetails[];
    if (status === 'All') {
      _prfDetails = await this.entityRepository.find({ where: { employeeId }, order: { prfNo: 'ASC' } });
    } else {
      _prfDetails = await this.entityRepository.find({ where: { employeeId, status }, order: { prfNo: 'ASC' } });
    }

    const prfDetails = await Promise.all(
      _prfDetails.map(async (prfDetail) => {
        const prfPositions = await this.prfPositionsService.entityRepository.find({
          select: ['_id', 'positionId', 'remarks'],
          where: { prfDetailsId: prfDetail._id },
          loadRelationIds: true,
        });
        return { ...prfDetail, prfPositions };
      }),
    );
    return prfDetails;
  }

  async getAllPrfsByStatus(prfStatus: string) {
    try {
      return await this.entityRepository
        .createQueryBuilder('prfd')
        .select('prfd._id', '_id')
        .addSelect('prfd.prf_no', 'prfNo')
        .addSelect('prfd.for', 'for')
        .addSelect('get_employee_fullname(employee_id_fk)', 'from')
        .addSelect('with_exam', 'withExam')
        .addSelect(`DATE_FORMAT(date_requested, '%Y-%m-%d')`, 'dateRequested')
        .addSelect('status')
        .addSelect(`GROUP_CONCAT(ppv.positionTitle SEPARATOR ', ')`, 'positionTitles')
        .innerJoin('prf_positions_view', 'ppv', 'ppv.prfDetailsId=prfd._id')
        .where(`status = :prfStatus`, { prfStatus })
        .groupBy('prfd._id')
        .orderBy('prfd.prf_no', 'DESC')
        .getRawMany();
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getAllApprovedPrfsV2(postingYear: number) {
    try {
      return await this.entityRepository.query(
        `
         SELECT DISTINCT 
          vpp._id vppId,
          get_employee_fullname2(prfd.employee_id_fk) requestingEntity,
          has_pending_acknowledgement(vpp._id) hasPendingAcknowledgement, 
          get_number_of_applicants(vpp._id) numberOfApplicants,
          get_number_of_applicants_selected_by_gm(vpp._id) numberOfSelectedApplicants,
          vpp.posting_date postingDate, 
          vpp.posting_deadline postingDeadline,
          vpp.posting_status postingStatus,
          GROUP_CONCAT(distinct pp._id order by pp.item_number ASC) positionId,
          GROUP_CONCAT(distinct pp.item_number order by pp.item_number ASC) itemNumber,
          vs.schedule schedule,
          vs.schedule_type scheduleType,
          vs.venue venue,
          pp.position_title positionTitle,
          get_plantilla_salary_grade(pp._id) salaryGrade,
          get_position_assignment(pp._id) assignment,
          prfd.with_exam withExam
        FROM vacant_position_posting vpp
          LEFT JOIN vpp_schedule vs ON vs.vacant_position_posting_id_fk = vpp._id
          INNER JOIN vpp_positions vppp ON vpp._id=vppp.vacant_position_posting_id_fk
          INNER JOIN prf_positions prfp ON prfp.position_id_fk = vppp.prf_positions_positions_id_fk
          INNER JOIN prf_details prfd ON prfd._id = prfp.prf_details_id_fk
          INNER JOIN plantilla_positions pp ON pp._id = vppp.prf_positions_positions_id_fk
        WHERE
         date_format(vpp.posting_date,'%Y') = ? 
         AND YEAR(prfp.created_at) = ?
        AND prfd.status = 'Approved' 
         GROUP BY 
         vpp._id,
         get_employee_fullname2(prfd.employee_id_fk),
		 has_pending_acknowledgement(vpp._id),
         vpp.posting_date,
         vpp.posting_deadline,
         vpp.posting_status,
         vs.schedule,
         vs.schedule_type,
         vs.venue,
         pp.position_title,
         get_plantilla_salary_grade(pp._id),
         get_position_assignment(pp._id),
         withExam
        ORDER BY itemNumber ASC;
    `,
        [postingYear, postingYear],
      );
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getPrfsByEmpIdAndPrfDetailsId(_id: string) {
    try {
      const prfDetails = await this.entityRepository
        .createQueryBuilder('prf')
        .select('prf._id', '_id')
        .addSelect('prf.prf_no', 'prfNo')
        .addSelect('prf.for', 'prfFor')
        .addSelect('get_gm_or_oic()', 'forPositionName')
        .addSelect('get_prf_emp_signature_by_name(prf.for)', 'forSignatureUrl')
        .addSelect('prf.with_exam', 'withExam')
        .addSelect('prf.status', 'status')
        .addSelect('prft.remarks', 'disapprovedRemarks')
        .addSelect('prf.date_requested', 'dateRequested')
        .addSelect('prf.date_needed', 'dateNeeded')
        .addSelect('prf.created_at', 'createdAt')
        .addSelect('prf.updated_at', 'updatedAt')
        .addSelect('get_employee_fullname(emp._id)', 'from')
        .addSelect('emp.signature_url', 'fromSignatureUrl')
        .addSelect('get_employee_position_or_oic(emp._id)', 'fromPositionName')
        .addSelect('get_employee_assignment(emp._id)', 'designation')
        .innerJoin('employees', 'emp', 'emp._id = prf.employee_id_fk')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .innerJoin('prf_trail', 'prft', 'prf._id=prft.prf_details_id_fk')
        .orderBy('prf.prf_no', 'DESC')
        .where('prf._id = :_id', { _id })
        .getRawOne();

      const prfPositions = await this.prfPositionsService.entityRepository
        .createQueryBuilder('prf_pos')
        .select('prf_pos.position_id_fk', 'positionId')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp.item_number', 'itemNumber')
        .addSelect('get_position_assignment(prf_pos.position_id_fk)', 'designation')
        .addSelect('remarks')
        .innerJoin('plantilla_positions', 'pp', 'pp._id = prf_pos.position_id_fk')
        .where('prf_pos.prf_details_id_fk = :prfDetailsId', { prfDetailsId: prfDetails._id })
        .getRawMany();

      const { prfFor, forPositionName, from, fromPositionName, fromSignatureUrl, forSignatureUrl, designation, ...rest } = prfDetails;
      return {
        ...rest,
        for: { name: prfFor, position: forPositionName, forSignatureUrl },
        from: { name: from, position: fromPositionName, designation, fromSignatureUrl },
        prfPositions,
      };
    } catch (error) {
      throw new HttpException('error', 500);
    }
  }

  async updatePrfStatus(prfDetailsDto: UpdatePrfDetailsDto) {
    try {
      const { _id, status } = prfDetailsDto;
      const result = await this.entityRepository.createQueryBuilder().update().set({ status }).where('_id = :_id', { _id }).execute();
      if (result.affected > 0) return prfDetailsDto;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async cancelPrf(prfDetailsDto: UpdatePrfDetailsDto) {
    const { _id } = prfDetailsDto;
    return await this.updatePrfStatus({ _id, status: PrfStatus.CANCELLED });
  }
}
