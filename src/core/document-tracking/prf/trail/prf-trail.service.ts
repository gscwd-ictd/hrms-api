import { getDateTimeNow } from 'src/global/utils/helper/date.helper';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PrfPositionsViewService } from 'src/core/prf-details/prf-positions/views/prf-positions-view/prf-positions-view.service';
import { VppPositionsService } from 'src/core/vacant-position-posting/sub-modules/vpp-positions/vpp-positions.service';
import { PostingStatus } from 'src/core/vacant-position-posting/utils/enums/posting-status.enum';
import { VacantPositionPostingService } from 'src/core/vacant-position-posting/vacant-position-posting.service';
import { Raw, Repository } from 'typeorm';
import { PrfTrailDTO } from './data/dtos/prf-trail.dto';
import { PrfTrail } from './data/entities/prf-trail.entity';
import { PrfTrailStatus } from './utils/enums/prf-trail-status.enum';
import { EmployeesService } from 'src/core/employees/employees.service';

@Injectable()
export class PrfTrailService extends BaseEntityCrudService<PrfTrail> {
  constructor(
    @InjectRepository(PrfTrail) private readonly prfTrailRepository: Repository<PrfTrail>,
    private readonly prfPositionsViewService: PrfPositionsViewService,
    private readonly vppService: VacantPositionPostingService,
    private readonly vppPositionsService: VppPositionsService,
    private readonly employeesService: EmployeesService,
  ) {
    super(prfTrailRepository);
  }

  async getPrfSignatures(employeeId: string) {
    try {
      if (employeeId === 'N/A' || employeeId === null) return 'N/A';
      return (await this.entityRepository.query(`SELECT signature_url signatureUrl FROM employees WHERE _id=?`, [employeeId]))[0].signatureUrl;
    } catch (error) {
      throw new HttpException('Error', error.status);
    }
  }

  async getPrfPhotoUrl(employeeId: string) {
    try {
      const photoUrl = employeeId === 'N/A' || employeeId === null ? 'N/A' : (await this.employeesService.getEmployeeDetailsByEmployeeId(employeeId)).photoUrl;
      return photoUrl;
    } catch (error) {
      throw new HttpException('Error', error.status);
    }
  }
  async getPrfsForApproval(employeeId: string) {
    try {
      return (await this.entityRepository.query('CALL sp_get_prfs_for_approval(?)', [employeeId]))[0];
    } catch (error) {
      throw new HttpException('Error', 500);
    }
  }

  async getPrfTrail(prfDetailsId: string) {
    try {
      const {
        divisionStatus,
        divisionHeadName,
        divisionHeadPosition,
        divisionDesignation,
        departmentStatus,
        departmentHeadName,
        departmentHeadPosition,
        departmentDesignation,
        agmStatus,
        agmName,
        agmPosition,
        agmDesignation,
        adminStatus,
        adminName,
        adminPosition,
        adminDesignation,
        gmStatus,
        gmName,
        gmPosition,
        gmDesignation,
        divisionStatusUpdatedAt,
        departmentStatusUpdatedAt,
        agmStatusUpdatedAt,
        adminStatusUpdatedAt,
        gmStatusUpdatedAt,
        divisionHeadId,
        departmentHeadId,
        agmId,
        adminId,
        gmId,
      } = (await this.entityRepository.query('CALL sp_get_prf_trail_signatories(?);', [prfDetailsId]))[0][0];

      return {
        division: {
          status: divisionStatus,
          employeeId: divisionHeadId,
          name: divisionHeadName,
          position: divisionHeadPosition,
          designation: divisionDesignation,
          updatedAt: divisionStatusUpdatedAt,
          signatureUrl: await this.getPrfSignatures(divisionHeadId),
          photoUrl: await this.getPrfPhotoUrl(divisionHeadId),
        },
        department: {
          status: departmentStatus,
          employeeId: departmentHeadId,
          name: departmentHeadName,
          position: departmentHeadPosition,
          designation: departmentDesignation,
          updatedAt: departmentStatusUpdatedAt,
          signatureUrl: await this.getPrfSignatures(departmentHeadId),
          photoUrl: await this.getPrfPhotoUrl(departmentHeadId),
        },
        agm: {
          status: agmStatus,
          employeeId: agmId,
          name: agmName,
          position: agmPosition,
          designation: agmDesignation,
          updatedAt: agmStatusUpdatedAt,
          signatureUrl: await this.getPrfSignatures(agmId),
          photoUrl: await this.getPrfPhotoUrl(agmId),
        },
        admin: {
          status: adminStatus,
          employeeId: adminId,
          name: adminName,
          position: adminPosition,
          designation: adminDesignation,
          updatedAt: adminStatusUpdatedAt,
          signatureUrl: await this.getPrfSignatures(adminId),
          photoUrl: await this.getPrfPhotoUrl(adminId),
        },
        gm: {
          status: gmStatus,
          employeeId: gmId,
          name: gmName,
          position: gmPosition,
          designation: gmDesignation,
          updatedAt: gmStatusUpdatedAt,
          signatureUrl: await this.getPrfSignatures(gmId),
          photoUrl: await this.getPrfPhotoUrl(gmId),
        },
      };
    } catch (error) {
      throw new HttpException('Error', 500);
    }
  }

  async updatePrf(prfDetailsId: string, prfTrailDto: PrfTrailDTO) {
    try {
      const prfTrail = (await this.entityRepository.query('CALL sp_get_prf_for_approval(?,?)', [prfDetailsId, prfTrailDto.employeeId]))[0][0];
      const prfTrailInitStatus = (await this.entityRepository.query('CALL sp_set_prf_trail_init_status2(?)', [prfTrailDto.employeeId]))[0][0];

      if (typeof prfTrail.departmentStatus !== 'undefined' && prfTrail.departmentStatus === 'For approval') {
        let departmentStatus: PrfTrailStatus = PrfTrailStatus.FOR_APPROVAL;
        departmentStatus = prfTrailDto.status;
        if (departmentStatus === 'Approved') {
          const _adminStatus = prfTrailInitStatus.agmStatus === 'N/A' ? PrfTrailStatus.FOR_APPROVAL : PrfTrailStatus.PENDING;
          if (
            (
              await this.entityRepository
                .createQueryBuilder()
                .update()
                .set({
                  departmentStatus,
                  agmStatus: prfTrailInitStatus.agmStatus === 'N/A' ? PrfTrailStatus.NA : PrfTrailStatus.FOR_APPROVAL,
                  adminStatus: _adminStatus,
                  departmentStatusUpdatedAt: getDateTimeNow(),
                })
                .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                .execute()
            ).affected != 0
          )
            return { prfDetailsId, ...prfTrailDto };
        }
        if (departmentStatus === 'Disapproved') {
          if (
            (
              await this.entityRepository
                .createQueryBuilder()
                .update()
                .set({
                  departmentStatus,
                  departmentStatusUpdatedAt: getDateTimeNow(),
                  agmStatus: PrfTrailStatus.DISAPPROVED,
                  agmStatusUpdatedAt: getDateTimeNow(),
                  adminStatus: PrfTrailStatus.DISAPPROVED,
                  adminStatusUpdatedAt: getDateTimeNow(),
                  gmStatus: PrfTrailStatus.DISAPPROVED,
                  gmStatusUpdatedAt: getDateTimeNow(),
                  remarks: prfTrailDto.remarks,
                })
                .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                .execute()
            ).affected != 0
          ) {
            if ((await this.entityRepository.query('UPDATE prf_details SET status=? WHERE _id = ?', ['Disapproved', prfDetailsId])).affectedRows > 0)
              return { prfDetailsId, ...prfTrailDto };
          }
        }
      }

      if (!prfTrail.adminStatus && typeof prfTrail.agmStatus !== 'undefined' && prfTrail.agmStatus === 'For approval') {
        let agmStatus: PrfTrailStatus = PrfTrailStatus.FOR_APPROVAL;
        agmStatus = prfTrailDto.status;
        if (agmStatus === 'Approved') {
          if (
            (
              await this.entityRepository
                .createQueryBuilder()
                .update()
                .set({
                  agmStatus,
                  agmStatusUpdatedAt: getDateTimeNow(),
                  adminStatus: PrfTrailStatus.FOR_APPROVAL,
                })
                .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                .execute()
            ).affected != 0
          )
            return { prfDetailsId, ...prfTrailDto };
        }
        if (agmStatus === 'Disapproved') {
          if (
            (
              await this.entityRepository
                .createQueryBuilder()
                .update()
                .set({
                  agmStatus,
                  agmStatusUpdatedAt: getDateTimeNow(),
                  adminStatus: PrfTrailStatus.DISAPPROVED,
                  adminStatusUpdatedAt: getDateTimeNow(),
                  gmStatus: PrfTrailStatus.DISAPPROVED,
                  gmStatusUpdatedAt: getDateTimeNow(),
                  remarks: prfTrailDto.remarks,
                })
                .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                .execute()
            ).affected != 0
          ) {
            if ((await this.entityRepository.query('UPDATE prf_details SET status=? WHERE _id = ?', ['Disapproved', prfDetailsId])).affectedRows > 0)
              return { prfDetailsId, ...prfTrailDto };
          }
        }
      }

      if (typeof prfTrail.adminStatus !== 'undefined') {
        if (!prfTrail.agmStatus) {
          let adminStatus: PrfTrailStatus = PrfTrailStatus.FOR_APPROVAL;
          adminStatus = prfTrailDto.status;
          if (adminStatus === 'Approved') {
            if (
              (
                await this.entityRepository
                  .createQueryBuilder()
                  .update()
                  .set({
                    adminStatus,
                    adminStatusUpdatedAt: getDateTimeNow(),
                    gmStatus: PrfTrailStatus.FOR_APPROVAL,
                  })
                  .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                  .execute()
              ).affected != 0
            )
              return { prfDetailsId, ...prfTrailDto };
          }
          if (adminStatus === 'Disapproved') {
            if (
              (
                await this.entityRepository
                  .createQueryBuilder()
                  .update()
                  .set({
                    adminStatus,
                    adminStatusUpdatedAt: getDateTimeNow(),
                    gmStatus: PrfTrailStatus.DISAPPROVED,
                    gmStatusUpdatedAt: getDateTimeNow(),
                    remarks: prfTrailDto.remarks,
                  })
                  .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                  .execute()
              ).affected != 0
            ) {
              if ((await this.entityRepository.query('UPDATE prf_details SET status=? WHERE _id = ?', ['Disapproved', prfDetailsId])).affectedRows > 0)
                return { prfDetailsId, ...prfTrailDto };
            }
          }
        }
        if (prfTrail.agmStatus === 'For approval' && prfTrail.adminStatus === 'Pending') {
          const agmStatus = prfTrailDto.status;
          if (agmStatus === 'Approved') {
            if (
              (
                await this.entityRepository
                  .createQueryBuilder()
                  .update()
                  .set({
                    agmStatus,
                    agmStatusUpdatedAt: getDateTimeNow(),
                    adminStatus: PrfTrailStatus.FOR_APPROVAL,
                    adminStatusUpdatedAt: getDateTimeNow(),
                    gmStatus: PrfTrailStatus.PENDING,
                  })
                  .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                  .execute()
              ).affected != 0
            )
              return { prfDetailsId, ...prfTrailDto };
          }
          if (agmStatus === 'Disapproved') {
            if (
              (
                await this.entityRepository
                  .createQueryBuilder()
                  .update()
                  .set({
                    agmStatus,
                    agmStatusUpdatedAt: getDateTimeNow(),
                    adminStatus: PrfTrailStatus.DISAPPROVED,
                    adminStatusUpdatedAt: getDateTimeNow(),
                    gmStatus: PrfTrailStatus.DISAPPROVED,
                    gmStatusUpdatedAt: getDateTimeNow(),
                    remarks: prfTrailDto.remarks,
                  })
                  .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                  .execute()
              ).affected != 0
            ) {
              if ((await this.entityRepository.query('UPDATE prf_details SET status=? WHERE _id = ?', ['Disapproved', prfDetailsId])).affectedRows > 0)
                return { prfDetailsId, ...prfTrailDto };
            }
          }
        }
      }

      if (typeof prfTrail.gmStatus !== 'undefined' && prfTrail.gmStatus === 'For approval') {
        let gmStatus: PrfTrailStatus = PrfTrailStatus.FOR_APPROVAL;
        gmStatus = prfTrailDto.status;
        if (gmStatus === 'Approved') {
          if (
            (
              await this.entityRepository
                .createQueryBuilder()
                .update()
                .set({
                  gmStatus,
                  gmStatusUpdatedAt: getDateTimeNow(),
                })
                .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                .execute()
            ).affected != 0
          ) {
            if ((await this.entityRepository.query('UPDATE prf_details SET status=? WHERE _id = ?', ['Approved', prfDetailsId])).affectedRows > 0) {
              //1. get grouped prf_positions by title, division, occupation, competency; (parameter: prf_details_id)
              const prfPositions = await this.prfPositionsViewService.entityRepository.find({ where: { prfDetailsId } });
              const vppData = await Promise.all(
                prfPositions.map(async (vppPosition) => {
                  //2. SAVE TO vpp set vppstatus to For csc approval
                  const vpp = await this.vppService.saveEntity({ postingDate: getDateTimeNow(), postingStatus: PostingStatus.FOR_CSC_APPROVAL });
                  //3. save grouped positions to vpp_positions;
                  const splittedPositions = vppPosition.positionId.split(',');
                  const vppPositions = await Promise.all(
                    splittedPositions.map(async (prfPositionsId) => {
                      return await this.vppPositionsService.saveEntity({ vppId: vpp._id, prfPositionsId });
                    }),
                  );
                  return { vppId: vpp._id, status: vpp.postingStatus, positions: vppPositions };
                }),
              );
              return { prfDetailsId, ...prfTrailDto, vppData };
            }
          }
        }
        if (gmStatus === 'Disapproved') {
          if (
            (
              await this.entityRepository
                .createQueryBuilder()
                .update()
                .set({
                  gmStatus,
                  gmStatusUpdatedAt: getDateTimeNow(),
                  remarks: prfTrailDto.remarks,
                })
                .where('prf_details_id_fk = :prfDetailsId', { prfDetailsId })
                .execute()
            ).affected != 0
          ) {
            if ((await this.entityRepository.query('UPDATE prf_details SET status=? WHERE _id = ?', ['Disapproved', prfDetailsId])).affectedRows > 0)
              return { prfDetailsId, ...prfTrailDto };
          }
        }
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async countApprovedPrf() {
    try {
      const currentYear = new Date().getFullYear();
      const count = await this.prfTrailRepository.count({
        where: {
          gmStatus: PrfTrailStatus.APPROVED,
          gmStatusUpdatedAt: Raw((alias) => `year(${alias}) = :year`, { year: currentYear }),
        },
      });
      return count;
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
