import { notArchivedPositionSql } from 'src/global/utils/archived-position.util';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { PlantillaPositions } from './data/entities/plantilla-positions.entity';
import { PlantillaPositionsAddDTO } from './data/dtos/plantilla-positions.dto';

@Injectable()
export class PlantillaPositionsService extends BaseEntityCrudService<PlantillaPositions> {
  constructor(@InjectRepository(PlantillaPositions) public plantillaPositionsRepository: Repository<PlantillaPositions>) {
    super(plantillaPositionsRepository);
  }

  async addNewPosition(addPositionDTO: PlantillaPositionsAddDTO) {
    const { itemNumber, positionTitle, salaryGrade, summary } = addPositionDTO.positionData;
    const result = await this.entityRepository.query('CALL sp_add_new_position(?,?,?,?,?);', [addPositionDTO.orgId, itemNumber, positionTitle, salaryGrade, summary]);
    if (result.affectedRows > 0) return addPositionDTO;
  }

  /**
   * Item no., title, office / department / division and salary grade of a position are locked while it is
   * occupied, or requested in a PRF (pending, or approved this year — the same rule as the PRF position list).
   */
  async getPositionEditLock(positionId: string): Promise<{ isLocked: boolean; lockReason: string | null }> {
    const [row] = (await this.entityRepository.query(
      `SELECT pp.employee_id_fk IS NOT NULL occupied, get_employee_fullname2(pp.employee_id_fk) holder,
              (SELECT pd.prf_no FROM prf_positions prfp INNER JOIN prf_details pd ON pd._id = prfp.prf_details_id_fk
                WHERE prfp.position_id_fk = pp._id
                  AND (pd.status = 'Pending' OR (pd.status = 'Approved' AND YEAR(pd.date_requested) = YEAR(NOW())))
                ORDER BY pd.date_requested DESC LIMIT 1) prfNo
         FROM plantilla_positions pp WHERE pp._id = ?;`,
      [positionId],
    )) as { occupied: string | number; holder: string | null; prfNo: string | null }[];
    if (!row) return { isLocked: false, lockReason: null };
    if (Number(row.occupied) === 1)
      return { isLocked: true, lockReason: `The position is occupied by ${(row.holder ?? '').trim()}.` };
    if (row.prfNo) return { isLocked: true, lockReason: `The position is requested in ${row.prfNo}.` };
    return { isLocked: false, lockReason: null };
  }

  async updatePosition(positionId: string, updatePositionDTO: PlantillaPositionsAddDTO) {
    // locked: only the job summary may change
    const lock = await this.getPositionEditLock(positionId);
    if (lock.isLocked) {
      const [current] = (await this.entityRepository.query(
        `SELECT item_number itemNumber, position_title positionTitle, salary_grade_id_fk salaryGradeId,
                get_position_assignment_id(_id) orgId FROM plantilla_positions WHERE _id = ?;`,
        [positionId],
      )) as { itemNumber: string; positionTitle: string; salaryGradeId: number; orgId: string }[];
      const { itemNumber, positionTitle, salaryGrade } = updatePositionDTO.positionData;
      if (
        current &&
        ((itemNumber ?? current.itemNumber) !== current.itemNumber ||
          (positionTitle ?? current.positionTitle).trim() !== current.positionTitle.trim() ||
          Number(salaryGrade ?? current.salaryGradeId) !== Number(current.salaryGradeId) ||
          (updatePositionDTO.orgId ?? current.orgId) !== current.orgId)
      )
        throw new HttpException(`${lock.lockReason} Only the job summary can be changed.`, 400);
    }
    try {
      const updateResult = await this.entityRepository.query(`CALL sp_update_position_data(?,?,?,?,?,?)`, [
        positionId,
        updatePositionDTO.orgId,
        updatePositionDTO.positionData.itemNumber,
        updatePositionDTO.positionData.positionTitle,
        updatePositionDTO.positionData.salaryGrade,
        updatePositionDTO.positionData.summary,
      ]);
      if (updateResult.affectedRows > 0) return { positionId, positionData: { ...updatePositionDTO } };
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getPositionsPerDivision(divisionId: string, withIds: number) {
    let positions = await this.entityRepository
      .createQueryBuilder('plantilla_positions')
      .select('distinct plantilla_positions._id', 'positionId')
      .addSelect('position_title', 'positionTitle')
      .innerJoin('division_positions', 'div_pos', 'div_pos.position_id_fk = plantilla_positions._id')
      .where('div_pos.division_id_fk = :divisionId', { divisionId })
      .getRawMany();

    if (withIds == 0) {
      positions = await this.entityRepository
        .createQueryBuilder('plantilla_positions')
        .select('position_title', 'positionTitle')
        .distinct(true)
        .innerJoin('division_positions', 'div_pos', 'div_pos.position_id_fk = plantilla_positions._id')
        .where('div_pos.division_id_fk = :divisionId', { divisionId })
        .getRawMany();
    }
    return positions;
  }

  /**
   *  for the customized dropdown of Vacant Plantilla Positions for HRIS
   *
   * @returns an array of vacant plantilla positions grouped pero org struct code
   */
  async getPositionsPerOrgStruct() {
    // let positionDropDown = [];
    const posquery = `SELECT position_title positionTitle,code,ppq.position_id positionId,sg.salary_grade salaryGrade from plantilla_positions pp,
      plantilla_dropdown_view ppq, salary_grade sg
  WHERE ppq.position_id = pp._id AND sg._id = pp.salary_grade_id_fk AND pp.employee_id_fk IS NULL AND nature_of_appointment='permanent' AND ${notArchivedPositionSql('pp')} AND code=?;
      `;
    const orgCode = await this.plantillaPositionsRepository.query(`SELECT divisions.name \`name\`,divisions.code \`code\` FROM divisions
        UNION SELECT departments.name \`name\`,departments.code \`code\` FROM departments UNION SELECT office.name \`name\`,office.code \`code\` FROM office;`);

    const positionDropDown = await Promise.all(
      orgCode.map(async (orgcode: any) => {
        const _code = orgcode.code;
        const positionTitles = await this.plantillaPositionsRepository.query(posquery, [_code]);

        const options = await Promise.all(
          positionTitles.map(async (positionTitle: any) => {
            return {
              label: positionTitle.positionTitle,
              value: {
                positionId: positionTitle.positionId,
                name: positionTitle.positionTitle,
                salaryGrade: positionTitle.salaryGrade,
              },
            };
          }),
        );
        return { label: orgcode.name, options };
      }),
    );
    return positionDropDown;
  }

  async getPositionsPerOrgStructWithOutOccupation() {
    const posquery = `SELECT position_title positionTitle,code,ppq.position_id positionId,sg.salary_grade salaryGrade from plantilla_positions pp,
      plantilla_dropdown_view ppq, salary_grade sg
  WHERE ppq.position_id = pp._id AND sg._id = pp.salary_grade_id_fk  AND pp.nature_of_appointment = 'permanent' AND pp._id NOT IN (SELECT position_id_fk FROM occupational_group) AND ${notArchivedPositionSql('pp')} AND code=?;
      `;
    const orgCode = await this.plantillaPositionsRepository.query(`SELECT divisions.name \`name\`,divisions.code \`code\` FROM divisions
        UNION SELECT departments.name \`name\`,departments.code \`code\` FROM departments UNION SELECT office.name \`name\`,office.code \`code\` FROM office;`);

    const positionDropDown = await Promise.all(
      orgCode.map(async (orgcode: any) => {
        const _code = orgcode.code;
        const positionTitles = await this.plantillaPositionsRepository.query(posquery, [_code]);

        const options = await Promise.all(
          positionTitles.map(async (positionTitle: any) => {
            return {
              label: positionTitle.positionTitle,
              value: {
                positionId: positionTitle.positionId,
                name: positionTitle.positionTitle,
                salaryGrade: positionTitle.salaryGrade,
              },
            };
          }),
        );
        return { label: orgcode.name, options };
      }),
    );
    return positionDropDown;
  }

  async countEmployees() {
    try {
      return await this.plantillaPositionsRepository.count();
    } catch (error) {
      Logger.log(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
