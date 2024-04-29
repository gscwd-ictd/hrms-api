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
        console.log(prfTrailObject);
        //call get_prf_trail_signatories('');

        const { divisionStatus, departmentStatus, agmStatus, adminStatus, gmStatus, boardStatus } = prfTrailObject;

        prfTrail = await transactionEntityManager.save(
          this.prfTrailService.createEntity({ prfDetailsId: prfDetails._id, divisionStatus, departmentStatus, agmStatus, adminStatus, gmStatus, boardStatus }),
        );

        prf = { prfDetails: { ...prfDetails, prfPositions: _prfPositions } };
      });
      return { prf, prfTrail };
    } catch (error) {
      console.log(error);
      if (error.code == 'ER_DUP_ENTRY') throw new HttpException('One or more positions were already been requested.', HttpStatus.NOT_ACCEPTABLE);
      throw new HttpException('Error adding PRF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
      throw new HttpException('Error', 500);
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

  async getPrfsByEmpIdAndPrfDetailsId(_id: string) {
    try {
      const prfDetails = await this.entityRepository
        .createQueryBuilder('prf')
        .select('prf._id', '_id')
        .addSelect('prf.prf_no', 'prfNo')
        .addSelect('prf.for', 'prfFor')
        .addSelect('get_gm_or_oic()', 'forPositionName')
        .addSelect('get_gm_signature_url()', 'forSignatureUrl')
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
