import { Injectable } from '@nestjs/common';
import { DepartmentPositionService } from '../organizational-positions/department-positions/department-positions.service';
import { DivisionPositionsService } from '../organizational-positions/division-positions/division-positions.service';
import { OfficePositionsService } from '../organizational-positions/office-positions/office-positions.service';
import { DepartmentService } from './department/department.service';
import { DivisionService } from './division/division.service';
import { OfficeService } from './office/office.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly officeService: OfficeService,
    private readonly officePositionsService: OfficePositionsService,

    private readonly departmentService: DepartmentService,
    private readonly departmentPositionsService: DepartmentPositionService,

    private readonly divisionService: DivisionService,
    private readonly divisionPositionsService: DivisionPositionsService,
  ) {}

  async getOrganizationById(orgId: string) {
    try {
      return (
        await this.officeService.entityRepository.query(
          `
            CALL sp_get_org_by_org_id(?);
        `,
          [orgId],
        )
      )[0][0];
    } catch (error) {}
  }

  async getAllOrganizationByGroup() {
    const offices = await this.officeService.getAllOffice();
    const departments = await this.departmentService.getAllDepartments();
    const divisions = await this.divisionService.getAllDivisions();
    const orgs = await Promise.all([{ offices }, { departments }, { divisions }]);
    return { ...orgs[0], ...orgs[1], ...orgs[2] };
  }

  async getOrganization() {
    const offices = await this.officePositionsService.entityRepository.query(
      `
        SELECT _id as id, name,code FROM office ORDER BY name ASC; 
      `,
    );

    const organizationResult = await Promise.all(
      offices.map(async (office) => {
        const { id } = office;

        const departmentsList = await this.departmentService.entityRepository.query(
          `
        SELECT _id as id, name,code FROM departments WHERE office_id_fk=? ORDER by name ASC;
        `,
          [id],
        );

        const departments = await Promise.all(
          departmentsList.map(async (department) => {
            const { id } = department;

            const divisions = await this.divisionService.entityRepository.query(`SELECT _id as id,name, code FROM divisions WHERE department_id_fk=?`, [id]);
            return { ...department, divisions };
          }),
        );

        return { ...office, departments };
      }),
    );

    return organizationResult;
  }

  async getOfficeById(_id: string) {
    return await this.officeService.findEntityById(_id);
  }

  async getOffices() {
    return await this.officeService.findEntityAll();
  }

  async getPositionsPerOffice(officeId: string, positionId?: string) {
    try {
      let positionQuery = '';
      positionId ? (positionQuery = ' AND op.position_id_fk = :positionId ') : '';
      return await this.officePositionsService.entityRepository
        .createQueryBuilder('office_positions')
        .select('op._id', '_id')
        .addSelect('op.position_id_fk', 'positionId')
        .addSelect('pp.item_number', 'itemNumber')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
        .addSelect('sg.salary_grade', 'salaryGrade')
        .addSelect('sg.step_increment', 'stepIncrement')
        .addSelect('sg.amount', 'actualSalary')
        .from('office_positions', 'op')
        .innerJoin('plantilla_positions', 'pp', 'op.position_id_fk = pp._id')
        .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
        .where(`op.office_id_fk = :officeId ${positionQuery}`, {
          officeId,
          positionId,
        })
        .getRawMany();
    } catch (error) {}
  }

  async getDepartments(officeId: string) {
    try {
      return await this.departmentService.entityRepository.find({
        where: { officeId },
      });
    } catch (error) {}
  }

  async getDepartmentByOfficeIdandDepartmentId(officeId: string, _id: string) {
    try {
      return await this.departmentService.entityRepository.findOne({
        where: { officeId, _id },
      });
    } catch (error) {}
  }

  async getPositionsPerDepartment(officeId: string, departmentId: string, positionId?: string) {
    try {
      let positionQuery = ' AND dept.office_id_fk=:officeId ';
      positionId ? (positionQuery = ' AND dept.office_id_fk=:officeId AND dp.position_id_fk = :positionId ') : '';
      return await this.departmentPositionsService.entityRepository
        .createQueryBuilder('department_positions')
        .select('dp._id', '_id')
        .addSelect('dp.position_id_fk', 'positionId')
        .addSelect('pp.item_number', 'itemNumber')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
        .addSelect('sg.salary_grade', 'salaryGrade')
        .addSelect('sg.step_increment', 'stepIncrement')
        .addSelect('sg.amount', 'actualSalary')
        .from('department_positions', 'dp')
        .innerJoin('plantilla_positions', 'pp', 'dp.position_id_fk = pp._id')
        .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
        .innerJoin('departments', 'dept', 'dept._id = dp.department_id_fk')
        .where(`dp.department_id_fk = :departmentId ${positionQuery}`, {
          departmentId,
          officeId,
          positionId,
        })
        .getRawMany();
    } catch (error) {}
  }

  async getDivisions(officeId: string, departmentId: string, _id?: string) {
    try {
      let divisionQuery = '';
      _id ? (divisionQuery = ' AND div._id = :_id') : '';
      return await this.divisionService.entityRepository
        .createQueryBuilder('div')
        .select('div.created_at', 'createdAt')
        .addSelect('div.updated_at', 'updatedAt')
        .addSelect('div._id', '_id')
        .addSelect('div.name', 'name')
        .addSelect('div.code', 'code')
        .addSelect('div.description', 'description')
        .innerJoin('departments', 'dept', 'dept._id = div.department_id_fk')
        .innerJoin('office', 'off', 'off._id = dept.office_id_fk')
        .where(`dept.office_id_fk = :officeId AND div.department_id_fk = :departmentId ${divisionQuery}`, {
          officeId,
          departmentId,
          _id,
        })
        .getRawMany();
    } catch (error) {}
  }

  async getDivisionPositions(officeId: string, departmentId: string, divisionId: string, _id?: string) {
    try {
      let positionIdQuery = '';
      _id ? (positionIdQuery = ' AND div_pos.position_id_fk = :_id ') : '';
      return await this.divisionPositionsService.entityRepository
        .createQueryBuilder('div_pos')
        .select('div_pos._id', '_id')
        .addSelect('div_pos.position_id_fk', 'positionId')
        .addSelect('pp.item_number', 'itemNumber')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
        .addSelect('sg.salary_grade', 'salaryGrade')
        .addSelect('sg.step_increment', 'stepIncrement')
        .addSelect('sg.amount', 'actualSalary')
        .innerJoin('divisions', 'div', 'div._id = div_pos.division_id_fk')
        .innerJoin('plantilla_positions', 'pp', 'pp._id = div_pos.position_id_fk')
        .innerJoin('departments', 'dept', 'dept._id = div.department_id_fk')
        .innerJoin('office', 'off', 'off._id = dept.office_id_fk')
        .innerJoin('salary_grade', 'sg', 'sg._id = pp.salary_grade_id_fk')
        .where(`off._id = :officeId AND dept._id = :departmentId AND div._id = :divisionId ${positionIdQuery}`, {
          officeId,
          departmentId,
          divisionId,
          _id,
        })
        .getRawMany();
    } catch (error) {}
  }

  async getAllOrgStructs() {
    try {
      const offices = await this.officeService.entityRepository.createQueryBuilder('off').select('off._id', '_id').addSelect('off.name', 'name').getRawMany();
      const departments = await this.departmentService.entityRepository
        .createQueryBuilder('dept')
        .select('dept._id', '_id')
        .addSelect('dept.name', 'name')
        .addSelect('dept.office_id_fk', 'officeId')
        .innerJoin('office', 'off', 'off._id = dept.office_id_fk')
        .getRawMany();
      const divisions = await this.divisionService.entityRepository
        .createQueryBuilder('div')
        .select('div._id', '_id')
        .addSelect('div.name', 'name')
        .addSelect('div.department_id_fk', 'departmentId')
        .innerJoin('departments', 'dept', 'dept._id = div.department_id_fk')
        .getRawMany();

      return { offices, departments, divisions };
    } catch (error) {}
  }

  async getAllOrgStructsLabelValue() {
    try {
      const offices = await this.officeService.entityRepository
        .createQueryBuilder('off')
        .select('off._id', 'value')
        .addSelect(`concat(off.code,' - ',off.name)`, 'label')
        .orderBy(`concat(off.code,' - ',off.name)`, 'ASC')
        .getRawMany();
      const departments = await this.departmentService.entityRepository
        .createQueryBuilder('dept')
        .select('dept._id', 'value')
        .addSelect(`CONCAT(dept.code,' - ',dept.name)`, 'label')
        //.addSelect('dept.office_id_fk', 'officeId')
        .innerJoin('office', 'off', 'off._id = dept.office_id_fk')
        .orderBy(`CONCAT(dept.code,' - ',dept.name)`, 'ASC')
        .getRawMany();
      const divisions = await this.divisionService.entityRepository
        .createQueryBuilder('div')
        .select('div._id', 'value')
        .addSelect(`concat(div.code,' - ',div.name)`, `label`)
        //.addSelect('div.department_id_fk','departmentId')
        .innerJoin('departments', 'dept', 'dept._id = div.department_id_fk')
        .orderBy(`concat(div.code,' - ',div.name)`, 'ASC')
        .getRawMany();

      return [...offices, ...departments, ...divisions];
    } catch (error) {}
  }

  async getAllOrgStructsMixed() {
    return await this.officeService.entityRepository.query(`SELECT _id, name FROM org_struct_view ORDER BY name ASC`);
  }

  async getAllAvailableOrgStructsMixed() {
    return await this.officeService.entityRepository.query(`SELECT _id value, name label FROM org_struct_view ORDER BY name ASC`);
  }

  async getAvailableOrgStructsMixed(orgIds: string[]) {
    if (orgIds.length > 0)
      return await this.officeService.entityRepository.query(`SELECT _id value,  name label FROM org_struct_view WHERE _id NOT IN (?) ORDER BY name ASC`, [orgIds]);
    return await this.getAllAvailableOrgStructsMixed();
  }

  //SELECT get_org_name_by_org_id('8f821209-f048-11ec-8d31-c4bde5a04065');
  async getOrgNameByOrgId(orgId: string) {
    return (await this.officeService.entityRepository.query(`SELECT get_org_name_by_org_id(?) orgName;`, [orgId]))[0].orgName;
  }

  async getAllDepartmentsAndOgm() {
    try {
      return await this.divisionService.entityRepository.query(
        `
        SELECT _id, name, orgStruct, code  
              FROM org_struct_view 
        WHERE orgStruct = 'department' AND code<>'LEG' OR 
        name = 'Office of the General Manager';`,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
