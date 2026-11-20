import { map } from 'rxjs';
import { OfficerInChargeDTO } from './data/officer-incharge.dto';
import { OfficerInChargeViewService } from './data/officer-in-charge-view/officer-in-charge-view.service';
import { OfficerInCharge } from './data/officer-in-charge.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

/**
 * A position can get an OIC when it is vacant, or when its holder is OIC of another position (the holder works in
 * that other position, so this one is technically vacant), e.g. FIN-CSD-001 while its holder is OIC of ADM-HRD-001.
 * Archived positions ("*", separated employees) never get an OIC.
 */
const OIC_ASSIGNABLE_POSITION_SQL = `(IFNULL(pp.item_number, '') NOT LIKE '%*%' AND pp.position_title NOT LIKE '%*%'
  AND (pp.employee_id_fk IS NULL OR pp.employee_id_fk IN (SELECT o.employee_id_fk FROM officer_in_charge o WHERE o.employee_id_fk IS NOT NULL)))`;
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OfficerInChargeService extends BaseEntityCrudService<OfficerInCharge> {
  constructor(
    @InjectRepository(OfficerInCharge) private readonly officerInChargeRepository: Repository<OfficerInCharge>,
    private readonly officerInChargeViewService: OfficerInChargeViewService,
  ) {
    super(officerInChargeRepository);
  }

  async getQualifiedForOfficerInCharge() {
    //all employees with salary grade 20 and up and not in officer-in-charge table
    try {
      const _qualifed = await this.entityRepository.query(`
      SELECT 
        emp._id employeeId, 
        get_employee_fullname2(emp._id) employeeFullName,
        get_employee_position(emp._id) positionTitle, 
        get_employee_assignment(emp._id) assignedTo,
        sg.salary_grade salaryGrade
      FROM plantilla_positions pp
        INNER JOIN employees emp ON pp.employee_id_fk = emp._id
        INNER JOIN salary_grade sg ON pp.salary_grade_id_fk =  sg._id
      WHERE sg.salary_grade>=20 AND pp.position_title != 'General Manager A' AND emp._id NOT IN(SELECT employee_id_fk FROM officer_in_charge)
        ORDER BY employeeFullName ASC
      ;
      `);

      const options = await Promise.all(
        _qualifed.map(async (item) => {
          const { employeeFullName, positionTitle, assignedTo, employeeId } = item;
          return {
            label: employeeFullName,
            value: {
              employeeId,
              employeeFullName,
              positionTitle,
              assignedTo,
            },
          };
        }),
      );

      return [{ options }];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getManagerialPositionsForOIC() {
    // vacant managerial positions, or held by an employee who is OIC of another position (technically vacant)
    try {
      const result = await this.entityRepository.query(`
      SELECT orgPositionId, positionTitle, assignedTo, orgType FROM ((SELECT 
        dp._id orgPositionId,
        pp.position_title positionTitle, 
        get_position_assignment(pp._id) assignedTo, 
        get_org_struct(get_position_assignment_id(pp._id)) orgType 
  FROM plantilla_positions pp 
        INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk
       INNER JOIN division_positions dp ON dp.position_id_fk = pp._id 
  WHERE ${OIC_ASSIGNABLE_POSITION_SQL} AND sg.salary_grade >= 24 
  ORDER BY positionTitle ASC,assignedTo ASC) 
  UNION 
  (SELECT 
        dp._id orgPositionId,
        pp.position_title positionTitle, 
        get_position_assignment(pp._id) assignedTo, 
        get_org_struct(get_position_assignment_id(pp._id)) orgType 
  FROM plantilla_positions pp 
        INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk
       INNER JOIN department_positions dp ON dp.position_id_fk = pp._id 
  WHERE ${OIC_ASSIGNABLE_POSITION_SQL} AND sg.salary_grade >= 24 
  ORDER BY positionTitle ASC,assignedTo ASC)
  UNION 
  (SELECT 
        dp._id orgPositionId,
        pp.position_title positionTitle, 
        get_position_assignment(pp._id) assignedTo, 
        get_org_struct(get_position_assignment_id(pp._id)) orgType 
  FROM plantilla_positions pp 
        INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk
       INNER JOIN office_positions dp ON dp.position_id_fk = pp._id 
  WHERE ${OIC_ASSIGNABLE_POSITION_SQL} AND sg.salary_grade >= 24 
  ORDER BY positionTitle ASC,assignedTo ASC)) assignable 
  WHERE assignable.orgPositionId NOT IN (SELECT orgPositionId FROM officer_in_charge_view);`);

      const options = await Promise.all(
        result.map(async (item) => {
          const { positionTitle, orgPositionId, assignedTo, orgType } = item;
          return {
            label: positionTitle,
            value: {
              orgPositionId,
              positionTitle,
              assignedTo,
              orgType,
            },
          };
        }),
      );

      return [{ options }];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getAllOfficerInCharge() {
    try {
      return await this.officerInChargeViewService.findEntityAll();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async addOfficerInCharge(oicDTO: OfficerInChargeDTO) {
    const { orgType, employeeId, orgPositionId } = oicDTO;
    // the position must be vacant, or its holder must be OIC of another position (technically vacant)
    const orgTable = { office: 'office_positions', department: 'department_positions', division: 'division_positions' }[orgType];
    if (!orgTable) throw new BadRequestException('Invalid organization type');
    const [position] = (await this.entityRepository.query(
      `SELECT pp.position_title positionTitle, get_employee_fullname2(pp.employee_id_fk) holder, ${OIC_ASSIGNABLE_POSITION_SQL} assignable
         FROM ${orgTable} op INNER JOIN plantilla_positions pp ON pp._id = op.position_id_fk WHERE op._id = ?;`,
      [orgPositionId],
    )) as { positionTitle: string; holder: string | null; assignable: string | number }[];
    if (!position) throw new BadRequestException('Position not found');
    if (Number(position.assignable) !== 1)
      throw new BadRequestException(
        `${position.positionTitle} is held by ${(position.holder ?? '').trim()}. An OIC can only be assigned to a vacant position, or to one whose holder is OIC of another position.`,
      );
    if ((await this.entityRepository.query(`SELECT 1 FROM officer_in_charge_view WHERE orgPositionId = ? LIMIT 1;`, [orgPositionId])).length > 0)
      throw new BadRequestException('This position already has an OIC');
    try {
      if (orgType === 'office') return await this.saveEntity({ employeeId, officePositionId: orgPositionId });
      if (orgType === 'department') return await this.saveEntity({ employeeId, departmentPositionId: orgPositionId });
      if (orgType === 'division') return await this.saveEntity({ employeeId, divisionPositionId: orgPositionId });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteOfficerInCharge(_id: string) {
    try {
      return await this.removeEntity(_id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
