import { Injectable } from '@nestjs/common';
import { DepartmentPositionService } from './department-positions/department-positions.service';
import { DivisionPositionsService } from './division-positions/division-positions.service';
import { OfficePositionsService } from './office-positions/office-positions.service';

@Injectable()
export class OrganizationalPositionsService {
  constructor(
    private readonly officePositionsService: OfficePositionsService,
    private readonly departmentPositionsService: DepartmentPositionService,
    private readonly divisionPositionsService: DivisionPositionsService,
  ) {}

  async getAssignmentPositions(_assignmentId: string, employeeId: string) {
    let organization: string;
    let assignmentId: string;
    let positionId: string;

    const oicDetails = await this.officePositionsService.entityRepository.query(`CALL sp_get_oic_details_row(?)`, [employeeId]);

    if (oicDetails[0][0].oicOrgId !== null) {
      assignmentId = oicDetails[0][0].oicOrgId;
      organization = oicDetails[0][0].oicAssignedOrg;
      positionId = oicDetails[0][0].oicPositionId;
      console.log(positionId, ' asdadsadsaasdsad oic');
    } else {
      assignmentId = _assignmentId;
      organization = (await this.officePositionsService.entityRepository.query('SELECT get_assignment_organization(?) AS organization;', [assignmentId]))[0].organization;
      positionId = (await this.officePositionsService.entityRepository.query(`SELECT _id positionId FROM plantilla_positions pp WHERE employee_id_fk = ?`, [employeeId]))[0]
        .positionId;
      console.log(positionId, ' asdadsadsaasdsad');
    }
    if (organization) {
      let positions = [];
      let department = [];
      let office = [];
      let division = [];
      let name: any;
      switch (organization) {
        case 'office':
          name = (
            await this.officePositionsService.entityRepository
              .createQueryBuilder('op')
              .select('name')
              .innerJoin('office', 'o', 'o._id = op.office_id_fk')
              .where('o._id = :assignmentId', { assignmentId })
              .getRawOne()
          ).name;
          console.log(name);
          if (name === 'Office of the General Manager') {
            office = await this.officePositionsService.entityRepository
              .createQueryBuilder('op')
              .select('pp._id', 'positionId')
              .addSelect('pp.item_number', 'itemNumber')
              .addSelect('pp.position_title', 'positionTitle')
              .addSelect('get_position_assignment(pp._id)', 'designation')
              .innerJoin('plantilla_positions', 'pp', 'pp._id = op.position_id_fk')
              .where(
                `pp.employee_id_fk IS NULL AND has_duties(pp._id) = true AND pp._id NOT IN (SELECT position_id_fk FROM
                prf_positions,prf_details, plantilla_positions
                WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled')) AND pp._id <> :positionId`,
                { positionId },
              )
              .getRawMany();
            department = await this.departmentPositionsService.entityRepository
              .createQueryBuilder('dp')
              .select('pp._id', 'positionId')
              .addSelect('pp.item_number', 'itemNumber')
              .addSelect('pp.position_title', 'positionTitle')
              .addSelect('get_position_assignment(pp._id)', 'designation')
              .innerJoin('plantilla_positions', 'pp', 'pp._id = dp.position_id_fk')
              .innerJoin('departments', 'd', 'd._id = dp.department_id_fk')
              .innerJoin('office', 'o', 'o._id = d.office_id_fk')
              .where(
                `pp.employee_id_fk IS NULL AND has_duties(pp._id) = true AND pp._id NOT IN (SELECT position_id_fk FROM
                prf_positions,prf_details, plantilla_positions
                WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled')) AND pp._id <> :positionId`,
                { positionId },
              )
              .getRawMany();
            division = await this.divisionPositionsService.entityRepository
              .createQueryBuilder('divp')
              .select('pp._id', 'positionId')
              .addSelect('pp.item_number', 'itemNumber')
              .addSelect('pp.position_title', 'positionTitle')
              .addSelect('get_position_assignment(pp._id)', 'designation')
              .innerJoin('plantilla_positions', 'pp', 'pp._id = divp.position_id_fk')
              .innerJoin('divisions', 'div', 'div._id = divp.division_id_fk')
              .innerJoin('departments', 'dept', 'dept._id = div.department_id_fk')
              .innerJoin('office', 'o', 'o._id = dept.office_id_fk')
              .where(
                `pp.employee_id_fk IS NULL AND has_duties(pp._id) = true  AND pp._id NOT IN (SELECT position_id_fk FROM
                prf_positions,prf_details, plantilla_positions
                WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled')) AND pp._id <> :positionId`,
                { positionId },
              )
              .getRawMany();
          } else {
            office = await this.officePositionsService.entityRepository
              .createQueryBuilder('op')
              .select('pp._id', 'positionId')
              .addSelect('pp.item_number', 'itemNumber')
              .addSelect('pp.position_title', 'positionTitle')
              .addSelect('get_position_assignment(pp._id)', 'designation')
              .innerJoin('plantilla_positions', 'pp', 'pp._id = op.position_id_fk')
              .where(
                `op.office_id_fk = :assignmentId  AND has_duties(pp._id) = true AND pp.employee_id_fk IS NULL AND pp._id NOT IN (SELECT position_id_fk FROM 
              prf_positions,prf_details, plantilla_positions 
              WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled')) AND pp._id <> :positionId`,
                { assignmentId, positionId },
              )
              .getRawMany();
            department = await this.departmentPositionsService.entityRepository
              .createQueryBuilder('dp')
              .select('pp._id', 'positionId')
              .addSelect('pp.item_number', 'itemNumber')
              .addSelect('pp.position_title', 'positionTitle')
              .addSelect('get_position_assignment(pp._id)', 'designation')
              .innerJoin('plantilla_positions', 'pp', 'pp._id = dp.position_id_fk')
              .innerJoin('departments', 'd', 'd._id = dp.department_id_fk')
              .innerJoin('office', 'o', 'o._id = d.office_id_fk')
              .where(
                `o._id = :assignmentId AND has_duties(pp._id) = true  AND pp.employee_id_fk IS NULL AND pp._id NOT IN (SELECT position_id_fk FROM 
              prf_positions,prf_details, plantilla_positions 
              WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled')) AND pp._id <> :positionId`,
                { assignmentId, positionId },
              )
              .getRawMany();
            division = await this.divisionPositionsService.entityRepository
              .createQueryBuilder('divp')
              .select('pp._id', 'positionId')
              .addSelect('pp.item_number', 'itemNumber')
              .addSelect('pp.position_title', 'positionTitle')
              .addSelect('get_position_assignment(pp._id)', 'designation')
              .innerJoin('plantilla_positions', 'pp', 'pp._id = divp.position_id_fk')
              .innerJoin('divisions', 'div', 'div._id = divp.division_id_fk')
              .innerJoin('departments', 'dept', 'dept._id = div.department_id_fk')
              .innerJoin('office', 'o', 'o._id = dept.office_id_fk')
              .where(
                `o._id = :assignmentId AND has_duties(pp._id) = true  AND pp.employee_id_fk IS NULL AND pp._id NOT IN (SELECT position_id_fk FROM 
              prf_positions,prf_details, plantilla_positions 
              WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled'))  AND pp._id <> :positionId`,
                { assignmentId, positionId },
              )
              .getRawMany();
          }
          positions.push(...office);
          positions.push(...department);
          positions.push(...division);
          break;
        case 'department':
          //not include his/her oic position
          name = await this.departmentPositionsService.entityRepository
            .createQueryBuilder('dp')
            .select('d.name', 'name')
            .innerJoin('departments', 'd', 'd._id = dp.department_id_fk')
            .where('d._id = :assignmentId', { assignmentId })
            .getRawOne();
          department = await this.departmentPositionsService.entityRepository
            .createQueryBuilder('dp')
            .select('pp._id', 'positionId')
            .addSelect('pp.item_number', 'itemNumber')
            .addSelect('pp.position_title', 'positionTitle')
            .addSelect('get_position_assignment(pp._id)', 'designation')
            .innerJoin('plantilla_positions', 'pp', 'pp._id = dp.position_id_fk')
            .innerJoin('departments', 'd', 'd._id = dp.department_id_fk')
            .where(
              `d._id = :assignmentId  AND has_duties(pp._id) = true AND pp.employee_id_fk IS NULL AND pp._id NOT IN (SELECT position_id_fk FROM 
              prf_positions,prf_details, plantilla_positions 
              WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled'))  AND pp._id <> :positionId`,
              { assignmentId, positionId },
            )
            .getRawMany();
          division = await this.divisionPositionsService.entityRepository
            .createQueryBuilder('divp')
            .select('pp._id', 'positionId')
            .addSelect('pp.item_number', 'itemNumber')
            .addSelect('pp.position_title', 'positionTitle')
            .addSelect('get_position_assignment(pp._id)', 'designation')
            .innerJoin('plantilla_positions', 'pp', 'pp._id = divp.position_id_fk')
            .innerJoin('divisions', 'div', 'div._id = divp.division_id_fk')
            .innerJoin('departments', 'dept', 'dept._id = div.department_id_fk')
            .where(
              `dept._id = :assignmentId AND has_duties(pp._id) = true  AND pp.employee_id_fk IS NULL AND pp._id NOT IN (SELECT position_id_fk FROM 
              prf_positions,prf_details, plantilla_positions 
              WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled')) AND pp._id <> :positionId`,
              { assignmentId, positionId },
            )
            .getRawMany();
          positions.push(...department);
          positions.push(...division);
          break;
        case 'division':
          name = await this.divisionPositionsService.entityRepository
            .createQueryBuilder('dp')
            .select('d.name', 'name')
            .innerJoin('divisions', 'd', 'd._id = dp.division_id_fk')
            .where('d._id = :assignmentId', { assignmentId })
            .getRawOne();
          division = await this.divisionPositionsService.entityRepository
            .createQueryBuilder('divp')
            .select('pp._id', 'positionId')
            .addSelect('pp.item_number', 'itemNumber')
            .addSelect('pp.position_title', 'positionTitle')
            .addSelect('get_position_assignment(pp._id)', 'designation')
            .innerJoin('plantilla_positions', 'pp', 'pp._id = divp.position_id_fk')
            .innerJoin('divisions', 'div', 'div._id = divp.division_id_fk')
            .where(
              `div._id = :assignmentId AND has_duties(pp._id) = true  AND pp.employee_id_fk IS NULL AND pp._id NOT IN (SELECT position_id_fk FROM 
              prf_positions,prf_details, plantilla_positions 
              WHERE position_id_fk = plantilla_positions._id AND prf_details._id = prf_positions.prf_details_id_fk AND (prf_details.status<>'Disapproved' OR prf_details.status<>'Cancelled')) AND pp._id <> :positionId`,
              { assignmentId, positionId },
            )
            .getRawMany();
          positions = division;
          break;
        default:
          break;
      }

      const _positions = positions.sort((a, b) => {
        if (a.positionTitle < b.positionTitle) return -1;
        else return 1;
      });

      return {
        organization,
        assignmentId,
        name,
        positions: _positions,
      };
    }
  }
}
