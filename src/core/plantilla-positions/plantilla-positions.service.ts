import { HttpException, Injectable } from '@nestjs/common';
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

  async updatePosition(positionId: string, updatePositionDTO: PlantillaPositionsAddDTO) {
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
    var positions = this.entityRepository
      .createQueryBuilder('plantilla_positions')
      .select('distinct plantilla_positions._id', 'positionId')
      .addSelect('position_title', 'positionTitle')
      .innerJoin('division_positions', 'div_pos', 'div_pos.position_id_fk = plantilla_positions._id')
      .where('div_pos.division_id_fk = :divisionId', { divisionId })
      .getRawMany();

    if (withIds == 0) {
      var positions = this.entityRepository
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
    let posquery = `SELECT position_title positionTitle,code,ppq.position_id positionId,sg.salary_grade salaryGrade from plantilla_positions pp,
      plantilla_dropdown_view ppq, salary_grade sg
  WHERE ppq.position_id = pp._id AND sg._id = pp.salary_grade_id_fk AND pp.employee_id_fk IS NULL AND nature_of_appointment='permanent' AND code=?;
      `;
    const orgCode = await this.plantillaPositionsRepository.query(`SELECT divisions.name \`name\`,divisions.code \`code\` FROM divisions
        UNION SELECT departments.name \`name\`,departments.code \`code\` FROM departments UNION SELECT office.name \`name\`,office.code \`code\` FROM office;`);

    const positionDropDown = await Promise.all(
      orgCode.map(async (orgcode: any) => {
        var _code = orgcode.code;
        var positionTitles = await this.plantillaPositionsRepository.query(posquery, [_code]);

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
    let posquery = `SELECT position_title positionTitle,code,ppq.position_id positionId,sg.salary_grade salaryGrade from plantilla_positions pp,
      plantilla_dropdown_view ppq, salary_grade sg
  WHERE ppq.position_id = pp._id AND sg._id = pp.salary_grade_id_fk  AND pp.nature_of_appointment = 'permanent' AND pp._id NOT IN (SELECT position_id_fk FROM occupational_group) AND code=?;
      `;
    const orgCode = await this.plantillaPositionsRepository.query(`SELECT divisions.name \`name\`,divisions.code \`code\` FROM divisions
        UNION SELECT departments.name \`name\`,departments.code \`code\` FROM departments UNION SELECT office.name \`name\`,office.code \`code\` FROM office;`);

    const positionDropDown = await Promise.all(
      orgCode.map(async (orgcode: any) => {
        var _code = orgcode.code;
        var positionTitles = await this.plantillaPositionsRepository.query(posquery, [_code]);

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
}
