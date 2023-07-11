import { map } from 'rxjs';
import { OfficerInChargeDTO } from './data/officer-incharge.dto';
import { OfficerInChargeViewService } from './data/officer-in-charge-view/officer-in-charge-view.service';
import { OfficerInCharge } from './data/officer-in-charge.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
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
      console.log(error);
    }
  }

  async getManagerialPositionsForOIC() {
    //all vacant managerial positions;
    try {
      const result = await this.entityRepository.query(`
      (SELECT 
        dp._id orgPositionId,
        pp.position_title positionTitle, 
        get_position_assignment(pp._id) assignedTo, 
        get_org_struct(get_position_assignment_id(pp._id)) orgType 
  FROM plantilla_positions pp 
        INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk
       INNER JOIN division_positions dp ON dp.position_id_fk = pp._id 
  WHERE pp.employee_id_fk IS NULL AND sg.salary_grade >= 24 
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
  WHERE pp.employee_id_fk IS NULL AND sg.salary_grade >= 24 
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
  WHERE pp.employee_id_fk IS NULL AND sg.salary_grade >= 24 
  ORDER BY positionTitle ASC,assignedTo ASC);`);

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
      console.log(error);
    }
  }

  async getAllOfficerInCharge() {
    try {
      return await this.officerInChargeViewService.findEntityAll();
    } catch (error) {
      console.log(error);
    }
  }

  async addOfficerInCharge(oicDTO: OfficerInChargeDTO) {
    try {
      const { orgType, employeeId, orgPositionId } = oicDTO;
      if (orgType === 'office') return await this.saveEntity({ employeeId, officePositionId: orgPositionId });
      if (orgType === 'department') return await this.saveEntity({ employeeId, departmentPositionId: orgPositionId });
      if (orgType === 'division') return await this.saveEntity({ employeeId, divisionPositionId: orgPositionId });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteOfficerInCharge(_id: string) {
    try {
      return await this.removeEntity(_id);
    } catch (error) {
      console.log(error);
    }
  }
}
