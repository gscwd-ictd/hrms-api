import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { OccupationalGroup } from './data/entities/occupational-group.entity';
import { OccupationalGroupDtoForMultiplePositions } from './data/dtos/occupational-group.dto';


@Injectable()
export class OccupationalGroupService extends BaseEntityCrudService<OccupationalGroup> {
  constructor(
    @InjectRepository(OccupationalGroup)
    private readonly occupationalGroup: Repository<OccupationalGroup>,
  ) {
    super(occupationalGroup);
  }

  async addPositionsToOccupationalGroup(occupationId: string, occupationalGroupDTO: OccupationalGroupDtoForMultiplePositions) {
    try {
      const occupationalGroup = await Promise.all(
        occupationalGroupDTO.positionIds.map(async (positionId) => {
          const { _id } = await this.saveEntity({ occupationId, positionId });
          const proficiencyIds = await this.entityRepository.query(`SELECT p._id proficiencyId FROM proficiency p 
              INNER JOIN competency_model cm ON cm._id = p.competency_id_fk 
              INNER JOIN domain d ON d._id = cm.domain_id_fk
            WHERE d.type= 'Core' AND  p.level = 'BASIC';    
          `);
          const pcpls = await Promise.all(
            proficiencyIds.map(async (proficiencyId) => {
              await this.entityRepository.query(
                `INSERT INTO 
                position_competency_proficiency_level(_id, occupational_group_id_fk, proficiency_id_fk)
                VALUES (uuid(), ?, ?)`,
                [_id, proficiencyId.proficiencyId],
              );
            }),
          );
          return { occupationalGroup: { _id, occupationId, positionId }, pcpls };
        }),
      );
      return occupationalGroup;
    } catch (error) {

      throw new HttpException(error.message, 500);
    }
  }

  async getPositionsPerOccupation(_id: string) {
    return await this.entityRepository
      .createQueryBuilder('og')
      .select('pp.item_number', 'itemNumber')
      .addSelect('pp._id', 'positionId')
      .distinct(true)
      .addSelect('get_position_assignment(pp._id)', 'assignedTo')
      .addSelect('pp.position_title', 'positionTitle')
      .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
      .addSelect('sg.salary_grade', 'salaryGrade')
      .addSelect('sg.amount', 'actualSalary')
      .innerJoin('occupations', 'o', 'o._id = og.occupation_id_fk')
      .innerJoin('plantilla_positions', 'pp', 'pp._id = og.position_id_fk')
      .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
      .where('o._id=:_id', { _id })
      .orderBy('pp.item_number', 'ASC')
      .getRawMany();
  }

  async deletePositionsFromOccupationalGroup(occupationId: string, positionIds: OccupationalGroupDtoForMultiplePositions) {
    try {
      const result = await this.entityRepository.query('DELETE FROM occupational_group WHERE position_id_fk IN (?) AND occupation_id_fk = ?', [
        positionIds.positionIds,
        occupationId,
      ]);
      if (result.affectedRows != 0) return { occupationId, positionIds: positionIds.positionIds };
    } catch (error) {
      if ((error.code = 'ER_ROW_IS_REFERENCED_2')) throw new HttpException("Competency's Proficiencies already set.", HttpStatus.NOT_ACCEPTABLE);
      throw new HttpException(error.message, 500);
    }
  }

  async getOccupationalGroupAndPositions() {
    try {
      return await this.entityRepository
        .createQueryBuilder('occupational_group')
        .select('occupational_group_id_fk', 'ogId')
        .addSelect('pp._id', 'positionId')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('occ._id', 'occId')
        .addSelect('occ.occupation_name', 'occupationName')
        .innerJoin('plantilla_positions', 'pp', 'pp._id = occupational_group.position_id_fk')
        .innerJoin('occupations', 'occ', 'occ._id = occupational_group.occupation_id_fk')
        .getRawMany();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
