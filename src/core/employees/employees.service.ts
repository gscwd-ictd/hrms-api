import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { EmailService } from 'src/global/auth/services/email.service';
import { EmployeeDTO, UpdateBasicEmployeeInfoDto } from 'src/core/employees/data/dtos/employee.dto';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { UserRole } from '../users/utils/enums/role.enum';
import { OfficerInChargeViewService } from '../officer-in-charge/data/officer-in-charge-view/officer-in-charge-view.service';
import { CommitteeMembersService } from '../committee-members/committee-members.service';
import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';
import { PlantillaPositions } from '../plantilla-positions/data/entities/plantilla-positions.entity';

@Injectable()
export class EmployeesService extends BaseEntityCrudService<Employees> {
  constructor(
    @Inject(MicroserviceType.AUTHN) private readonly clientAuthn: ClientProxy,
    @Inject(MicroserviceType.EMPLOYEE_MONITORING) private readonly clientEms: ClientProxy,
    @InjectRepository(Employees) private readonly employeeRepository: Repository<Employees>,
    private readonly plantillaPositionsService: PlantillaPositionsService,
    private readonly emailService: EmailService,
    private readonly officerInChargeViewService: OfficerInChargeViewService,
    private readonly committeeMembersService: CommitteeMembersService,
  ) {
    super(employeeRepository);
  }

  async getEmployeeNameById(_id: string) {
    const empName = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('get_employee_fullname2(emp._id)', 'fullName')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('emp._id = :_id', { _id })
      .getRawOne();
    return empName;
  }

  async getEmployeePortalDetails(_id: string) {
    try {
      return await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, _id));
    } catch (error) {
      return {
        email: null,
        photoUrl: null,
      };
    }
  }

  async getEmployeeDetails(_id: string) {
    const empPosition = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('emp._id', 'userId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('pp.position_title', 'positionTitle')
      .addSelect('pp._id', 'positionId')
      .addSelect('get_employee_fullname2(emp._id)', 'fullName')
      .addSelect('get_employee_fullname(emp._id)', 'fullNameFirst')
      .addSelect('get_employee_assignment_id(emp._id)', 'id')
      .addSelect('get_employee_assignment(emp._id)', 'name')
      .addSelect('get_user_role(emp._id)', 'userRole')
      .addSelect('is_hrm_psb(emp._id)', 'isHRMPSB')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('emp._id = :_id', { _id })
      .getRawOne();

    const { id, name, userId, companyId, positionId, positionTitle, fullNameFirst, fullName, isHRMPSB, userRole } = empPosition;
    const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, userId));
    const overtimeImmediateSupervisorId = await lastValueFrom(this.clientEms.send('get_overtime_immediate_supervisor', _id));
    const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];
    const employeeSchedule = await lastValueFrom(this.clientEms.send('get_employee_schedule', _id));

    return {
      userId,
      ...employeePortalDetails,
      companyId: companyId !== null ? companyId : 'BOD001',
      fullName,
      fullNameFirst,
      isHRMPSB,
      scheduleBase: employeeSchedule.schedule.scheduleBase,
      overtimeImmediateSupervisorId,
      assignment: { id, name, officeName, divisionName, departmentName, positionId, positionTitle },
      userRole,
    };
  }

  async getEmployeesByOrgId(orgId: string) {
    const employees = (await this.entityRepository.query(`CALL sp_get_employees_under_org_id(?);`, [orgId]))[0];
    return employees;
  }

  async getEmployeesByOrgIdWithManagers(orgId: string) {
    const employees = (await this.entityRepository.query(`CALL sp_get_employees_with_manager_under_org_id(?);`, [orgId]))[0];
    return employees;
  }

  async getEmployeesByOrgId2(orgId: string) {
    const employees = (await this.entityRepository.query(`CALL sp_get_employees_under_org_id2(?);`, [orgId]))[0];
    return employees;
  }

  async testEmail() {
    return await this.emailService.sendEmail('jofhernilapirot@gmail.com', '62fef63c-b26f-11ed-a79b-000c29f95a80', 1, null);
  }

  async getEmployeesUnderSupervisor(employeeId: string) {
    const orgId = (await this.entityRepository.query('SELECT get_employee_assignment_id(?) orgId;', [employeeId]))[0];
    return await this.getEmployeesByOrgId(employeeId);
  }

  async getEmployeeWithSupervisor(employeeId: string) {
    try {
      const employeeDetails = await this.getEmployeeDetailsByEmployeeId(employeeId);
      const supervisorDetails = await this.getEmployeeDetailsByEmployeeId(await this.getEmployeeSupervisor(employeeId, false));
      return {
        employee: {
          _id: employeeDetails.userId,
          name: employeeDetails.employeeFullName,
          positionTitle: employeeDetails.assignment.positionTitle,
          assignment: employeeDetails.assignment.name,
        },
        supervisor: {
          _id: supervisorDetails.userId,
          name: supervisorDetails.employeeFullName,
          positionTitle: supervisorDetails.assignment.positionTitle,
          assignment: supervisorDetails.assignment.name,
        },
      };
    } catch (error) {
      throw new error(error);
    }
  }

  async getAllEmployeesWithSupervisor() {
    try {
      const employeeList = await this.getAllPermanentCasualEmployees();
      const employees = await Promise.all(
        employeeList.map(async (emp) => {
          const { value } = emp;
          const employeeDetails = await this.getEmployeeDetailsByEmployeeId(value);
          const supervisorDetails = await this.getEmployeeDetailsByEmployeeId(await this.getEmployeeSupervisor(value, false));
          const hrdDetails = await this.getEmployeeDetailsByEmployeeId(await this.getHrdManager());
          return {
            employee: {
              _id: employeeDetails.userId,
              name: employeeDetails.employeeFullName,
              positionTitle: employeeDetails.assignment.positionTitle,
              assignment: employeeDetails.assignment.name,
            },
            supervisor: {
              _id:
                employeeDetails.assignment.positionTitle === 'OIC-General Manager' || employeeDetails.assignment.positionTitle === 'General Manager A'
                  ? hrdDetails.userId
                  : supervisorDetails.userId,
              name:
                employeeDetails.assignment.positionTitle === 'OIC-General Manager' || employeeDetails.assignment.positionTitle === 'General Manager A'
                  ? hrdDetails.employeeFullName
                  : supervisorDetails.employeeFullName,
              positionTitle:
                employeeDetails.assignment.positionTitle === 'OIC-General Manager' || employeeDetails.assignment.positionTitle === 'General Manager A'
                  ? hrdDetails.assignment.positionTitle
                  : supervisorDetails.assignment.positionTitle,
              assignment:
                employeeDetails.assignment.positionTitle === 'OIC-General Manager' || employeeDetails.assignment.positionTitle === 'General Manager A'
                  ? hrdDetails.assignment.name
                  : supervisorDetails.assignment.name,
            },
          };
        }),
      );

      return employees;
    } catch (error) {
      throw new error(error);
    }
  }

  async getEmployeeByIdForLND(employeeId: string) {
    const empPosition = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('emp._id', 'employeeId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('pp.position_title', 'positionTitle')
      .addSelect('pp._id', 'positionId')
      .addSelect('get_employee_assignment_id(emp._id)', 'id')
      .addSelect('get_employee_assignment(emp._id)', 'name')
      .addSelect('get_employee_fullname2(emp._id)', 'employeeFullName')
      .addSelect('get_employee_fullname(emp._id)', 'fullNameFirst')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('pp.employee_id_fk IS NOT NULL AND company_id IS NOT NULL AND emp._id=:employeeId', { employeeId })
      .getRawOne();

    const { id, employeeFullName, fullNameFirst, companyId, positionTitle } = empPosition;

    const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, employeeId));

    const orgStruct = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0] as {
      officeId: string;
      officeName: string;
      departmentId: string;
      departmentName: string;
      divisionId: string;
      divisionName: string;
    };
    const { departmentName, divisionName, officeName } = orgStruct;
    return {
      id: employeeId,
      companyId,
      fullName: employeeFullName,
      fullNameFirst,
      avatar: employeePortalDetails.photoUrl,
      email: employeePortalDetails.emailAddress,
      division: divisionName,
      department: departmentName,
      office: officeName,
      positionTitle,
    };
  }

  async getEmployeesForLND() {
    const empPositions = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('emp._id', 'employeeId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('pp.position_title', 'positionTitle')
      .addSelect('pp._id', 'positionId')
      .addSelect('get_employee_assignment_id(emp._id)', 'id')
      .addSelect('get_employee_assignment(emp._id)', 'name')
      .addSelect('get_employee_fullname2(emp._id)', 'employeeFullName')
      .addSelect('get_employee_fullname(emp._id)', 'fullNameFirst')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('pp.employee_id_fk IS NOT NULL AND company_id IS NOT NULL')
      .getRawMany();

    const employees = await Promise.all(
      empPositions.map(async (empPosition) => {
        const { id, name, employeeId, employeeFullName, fullNameFirst, companyId, positionTitle } = empPosition;

        const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, employeeId));

        const orgStruct = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0] as {
          officeId: string;
          officeName: string;
          departmentId: string;
          departmentName: string;
          divisionId: string;
          divisionName: string;
        };
        const { departmentName, divisionName, officeName } = orgStruct;

        return {
          id: employeeId,
          companyId,
          fullName: employeeFullName,
          fullNameFirst,
          avatar: employeePortalDetails.photoUrl,
          email: employeePortalDetails.emailAddress,
          division: divisionName,
          department: departmentName,
          office: officeName,
          positionTitle,
        };
      }),
    );
    return employees;
  }

  async getEmployeeDetailsWithSignatureByEmployeeId(employeeId: string) {
    try {
      const empPosition = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'userId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_position_or_oic(emp._id)', 'positionTitle')
        .addSelect('get_employee_position_id_or_oic(emp._id)', 'positionId')
        .addSelect('get_position_assignment_id(get_employee_position_id_or_oic(emp._id))', 'id')
        .addSelect('get_position_assignment(get_employee_position_id_or_oic(emp._id))', 'name')
        .addSelect('is_hrm_psb(emp._id)', 'isHRMPSB')
        .addSelect('emp.signature_url', 'signatureUrl')
        .addSelect('get_employee_fullname(emp._id)', 'employeeFullName')
        .addSelect('get_employee_fullname2(emp._id)', 'employeefullNameFirst')
        .addSelect('get_user_role(emp._id)', 'userRole')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .where('emp._id = :employeeId', { employeeId })
        .getRawOne();

      const employeeSchedule = await this.getEmployeeSchedule(employeeId);

      const isPdcChairman = await this.committeeMembersService.isPdcChairman(employeeId);
      const isPdcSecretariat = await this.committeeMembersService.isPdcSecretariat(employeeId);
      const { id, name, userId, employeeFullName, employeeFullNameFirst, companyId, positionId, positionTitle, isHRMPSB, userRole, signatureUrl } = empPosition;
      const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];
      const salaryGradeDetails = await this.getMonthHourlyRateByEmployeeId(employeeId);

      const salaryGradeAmount = salaryGradeDetails.monthlyRate;

      const salaryGrade = salaryGradeDetails.salaryGrade;

      const salaryGradeLevel = salaryGradeDetails.salaryGradeLevel;

      const salaryGradeStepIncrement = salaryGradeDetails.stepIncrement;

      const photoUrl = await this.getEmployeePhotoUrlFromPortal(employeeId);

      const dailyRate = salaryGradeDetails.dailyRate;

      return {
        userId,
        companyId,
        isPdcChairman,
        isPdcSecretariat,
        employeeFullName,
        employeeFullNameFirst,
        photoUrl,
        signatureUrl,
        salaryGradeAmount,
        salaryGrade,
        salaryGradeLevel,
        salaryGradeStepIncrement,
        dailyRate,
        isHRMPSB,
        assignment: { id, name, positionId, positionTitle },
        orgStruct: { officeName, divisionName, departmentName },
        scheduleBase: employeeSchedule.scheduleBase,
        userRole,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getBasicEmployeeDetailsByEmployeeId(employeeId: string) {
    try {
      const empPosition = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'userId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_position_or_oic(emp._id)', 'positionTitle')
        .addSelect('get_employee_position_id_or_oic(emp._id)', 'positionId')
        .addSelect('get_position_assignment_id(get_employee_position_id_or_oic(emp._id))', 'id')
        .addSelect('get_position_assignment(get_employee_position_id_or_oic(emp._id))', 'name')
        .addSelect('is_hrm_psb(emp._id)', 'isHRMPSB')
        .addSelect('get_employee_fullname2(emp._id)', 'employeeFullName')
        .addSelect('get_employee_fullname(emp._id)', 'employeeFullNameFirst')
        .addSelect('get_user_role(emp._id)', 'userRole')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .where('emp._id = :employeeId', { employeeId })
        .getRawOne();

      const { id, name, userId, employeeFullName, companyId, positionId, positionTitle, userRole, employeeFullNameFirst } = empPosition;
      const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];

      const photoUrl = await this.getEmployeePhotoUrlFromPortal(employeeId);

      console.log(photoUrl);

      return {
        userId,
        companyId,
        employeeFullName,
        employeeFullNameFirst,
        photoUrl,
        assignment: { id, name, positionId, positionTitle },
        orgStruct: { officeName, divisionName, departmentName },
        userRole,
      };
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  }

  async getBasicEmployeeDetailsByEmployeeIdWithSignature(employeeId: string) {
    try {
      const empPosition = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'userId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_position_or_oic(emp._id)', 'positionTitle')
        .addSelect('get_employee_position_id_or_oic(emp._id)', 'positionId')
        .addSelect('get_position_assignment_id(get_employee_position_id_or_oic(emp._id))', 'id')
        .addSelect('get_position_assignment(get_employee_position_id_or_oic(emp._id))', 'name')
        .addSelect('is_hrm_psb(emp._id)', 'isHRMPSB')
        .addSelect('get_employee_fullname2(emp._id)', 'employeeFullName')
        .addSelect('get_employee_fullname(emp._id)', 'employeeFullNameFirst')
        .addSelect('get_user_role(emp._id)', 'userRole')
        .addSelect('emp.signature_url', 'signatureUrl')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .where('emp._id = :employeeId', { employeeId })
        .getRawOne();

      const { id, name, userId, employeeFullName, companyId, signatureUrl, positionId, positionTitle, userRole, employeeFullNameFirst } = empPosition;
      const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];

      const photoUrl = await this.getEmployeePhotoUrlFromPortal(employeeId);

      return {
        userId,
        companyId,
        employeeFullName,
        employeeFullNameFirst,
        signatureUrl,
        photoUrl,
        assignment: { id, name, positionId, positionTitle },
        orgStruct: { officeName, divisionName, departmentName },
        userRole,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.status, error.message);
    }
  }

  async getEmployeeDetailsByEmployeeId(employeeId: string) {
    try {
      const empPosition = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'userId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_position_or_oic(emp._id)', 'positionTitle')
        .addSelect('get_employee_position_id_or_oic(emp._id)', 'positionId')
        .addSelect('get_position_assignment_id(get_employee_position_id_or_oic(emp._id))', 'id')
        .addSelect('get_position_assignment(get_employee_position_id_or_oic(emp._id))', 'name')
        .addSelect('is_hrm_psb(emp._id)', 'isHRMPSB')
        .addSelect('get_employee_fullname2(emp._id)', 'employeeFullName')
        .addSelect('get_employee_fullname(emp._id)', 'employeeFullNameFirst')
        .addSelect('get_user_role(emp._id)', 'userRole')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .where('emp._id = :employeeId', { employeeId })
        .getRawOne();

      const employeeSchedule = await this.getEmployeeSchedule(employeeId);

      const isPdcChairman = await this.committeeMembersService.isPdcChairman(employeeId);
      const isPdcSecretariat = await this.committeeMembersService.isPdcSecretariat(employeeId);
      const { id, name, userId, employeeFullName, companyId, positionId, positionTitle, isHRMPSB, userRole, employeeFullNameFirst } = empPosition;
      const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];
      const salaryGradeDetails = await this.getMonthHourlyRateByEmployeeId(employeeId);

      const salaryGradeAmount = salaryGradeDetails.monthlyRate;

      const salaryGrade = salaryGradeDetails.salaryGrade;

      const photoUrl = await this.getEmployeePhotoUrlFromPortal(employeeId);

      return {
        userId,
        companyId,
        isPdcChairman,
        isPdcSecretariat,
        employeeFullName,
        employeeFullNameFirst,
        photoUrl,
        salaryGradeAmount,
        salaryGrade,
        isHRMPSB,
        assignment: { id, name, positionId, positionTitle },
        orgStruct: { officeName, divisionName, departmentName },
        scheduleBase: employeeSchedule.scheduleBase,
        userRole,
      };
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  }

  async getEmployeesByOrgIdAlone(orgId: string) {
    return (await this.entityRepository.query(`CALL get_employees_by_org(?);`, [orgId]))[0];
  }

  async getEmployeeDetailByCompanyId(_companyId: string) {
    try {
      const empPosition = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'userId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp._id', 'positionId')
        .addSelect('get_employee_assignment_id(emp._id)', 'id')
        .addSelect('get_employee_assignment(emp._id)', 'name')
        .addSelect('get_employee_fullname(emp._id)', 'employeeFullName')
        .addSelect('get_user_role(emp._id)', 'userRole')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .where('emp.company_id = :_companyId', { _companyId })
        .getRawOne();
      const { id, name, userId, employeeFullName, companyId, positionId, positionTitle, userRole } = empPosition;

      const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, userId));

      return {
        userId,
        companyId,
        employeeFullName,
        photoUrl: employeePortalDetails.photoUrl,
        assignment: { id, name, positionId, positionTitle },
        userRole,
      };
    } catch (error) {}
  }

  async getEmployeeDetailByCompanyIdMS(_companyId: string) {
    try {
      const empPosition = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'userId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp._id', 'positionId')
        .addSelect('get_employee_assignment_id(emp._id)', 'id')
        .addSelect('get_employee_assignment(emp._id)', 'name')
        .addSelect('get_employee_fullname2(emp._id)', 'employeeFullName')
        .addSelect('get_employee_fullname(emp._id)', 'employeeFullNameFirst')
        .addSelect('get_user_role(emp._id)', 'userRole')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .where('emp.company_id = :_companyId', { _companyId })
        .getRawOne();
      const { id, name, userId, employeeFullName, companyId, positionId, positionTitle, userRole } = empPosition;

      const photoUrl = await this.getEmployeePhotoUrlFromPortal(userId);
      return {
        userId,
        companyId,
        employeeFullName,
        photoUrl,
        assignment: { id, name, positionId, positionTitle },
        userRole,
      };
    } catch (error) {
      throw new RpcException('Employee not found. but not sure. ');
    }
  }

  async getCustomGroupsUnassignedJobOrderCOSMember(employeeIds: string[]) {
    let unassignedEmployees;
    if (employeeIds.length === 0) {
      unassignedEmployees = await this.entityRepository.query(
        `
        SELECT 
          emp._id employeeId,
          emp.company_id companyId,
          get_employee_fullname2(emp._id) fullName,
          pp.position_title positionTitle,
          get_employee_assignment(emp._id) assignment 
        FROM employees emp INNER JOIN plantilla_positions pp ON 
        emp._id = pp.employee_id_fk WHERE nature_of_appointment = 'contract of service' OR nature_of_appointment = 'job order' 
        ORDER BY get_employee_fullname2(emp._id) ASC
      `,
      );
    } else
      unassignedEmployees = await this.entityRepository.query(
        `
      SELECT 
        emp._id employeeId,
        emp.company_id companyId,
        get_employee_fullname2(emp._id) fullName,
        pp.position_title positionTitle,
        get_employee_assignment(emp._id) assignment 
      FROM employees emp INNER JOIN plantilla_positions pp ON 
      emp._id = pp.employee_id_fk WHERE emp._id NOT IN (?) AND (nature_of_appointment = 'contract of service' OR nature_of_appointment = 'job order') 
      ORDER BY get_employee_fullname2(emp._id) ASC
    `,
        [employeeIds],
      );

    return unassignedEmployees;
  }

  async getCompanyIdsByOrgId(orgId: string) {
    try {
      return (await this.entityRepository.query(`CALL sp_get_employees_company_id_under_org_id(?);`, [orgId]))[0];
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getCustomGroupsUnassignedRankFileMember(employeeIds: string[]) {
    let unassignedEmployees;
    if (employeeIds.length === 0) {
      unassignedEmployees = await this.entityRepository.query(
        `
        SELECT 
          emp._id employeeId,
          emp.company_id companyId,
          get_employee_fullname2(emp._id) fullName,
          pp.position_title positionTitle,
          get_employee_assignment(emp._id) assignment 
        FROM employees emp INNER JOIN plantilla_positions pp ON 
        emp._id = pp.employee_id_fk WHERE nature_of_appointment = 'casual' OR nature_of_appointment = 'permanent' 
        ORDER BY get_employee_fullname2(emp._id) ASC
      `,
      );
    } else
      unassignedEmployees = await this.entityRepository.query(
        `
      SELECT 
        emp._id employeeId,
        emp.company_id companyId,
        get_employee_fullname2(emp._id) fullName,
        pp.position_title positionTitle,
        get_employee_assignment(emp._id) assignment 
      FROM employees emp INNER JOIN plantilla_positions pp ON 
      emp._id = pp.employee_id_fk WHERE emp._id NOT IN (?) AND (nature_of_appointment = 'casual' OR nature_of_appointment = 'permanent') 
      ORDER BY get_employee_fullname2(emp._id) ASC
    `,
        [employeeIds],
      );

    return unassignedEmployees;
  }

  async getCustomGroupsAssignedMember(employeeIds: string[]) {
    let assignedEmployees;
    if (employeeIds.length === 0) return [];
    else
      assignedEmployees = await this.entityRepository.query(
        `
      SELECT 
        emp._id employeeId,
        emp.company_id companyId,
        get_employee_fullname2(emp._id) fullName,
        pp.position_title positionTitle,
        get_employee_assignment(emp._id) assignment 
      FROM employees emp INNER JOIN plantilla_positions pp ON 
      emp._id = pp.employee_id_fk WHERE emp._id IN (?) ORDER BY get_employee_fullname2(emp._id) ASC;
    `,
        [employeeIds],
      );

    return assignedEmployees;
  }

  async getEmployeeDetailsEMS(_id: string) {
    const empPosition = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('emp._id', 'userId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('first_name', 'firstName')
      .addSelect('middle_name', 'middleName')
      .addSelect('last_name', 'lastName')
      .addSelect('name_extension', 'nameExtension')
      .addSelect('pp.position_title', 'positionTitle')
      .addSelect('pp._id', 'positionId')
      .addSelect('get_leave_form_assignment(pp._id)', 'name')
      .addSelect("CONCAT('₱ ',FORMAT(get_salary_grade_amount(pp.salary_grade_id_fk),2))", 'salary')
      .addSelect('get_employee_assignment_id(emp._id)', 'id')
      .addSelect('get_user_role(emp._id)', 'userRole')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('emp._id = :_id', { _id })
      .getRawOne();

    const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, _id));

    const { id, name, userId, companyId, positionId, positionTitle, userRole, salary, firstName, middleName, lastName, nameExtension } = empPosition;
    return {
      userId,
      companyId,
      firstName,
      middleName,
      lastName,
      nameExtension,
      photoUrl: employeePortalDetails.photoUrl,
      assignment: { id, name, positionId, positionTitle, salary },
      userRole,
    };
  }

  async getEmployeeNameByIdForEmpMonitoring(ids: { employeeId: string; supervisorId: string }) {
    try {
      const { employeeId, supervisorId } = ids;
      const employeeSignature = await this.getEmployeeSignature(employeeId);
      const supervisorSignature = await this.getEmployeeSignature(supervisorId);
      const employeeName = (await this.getEmployeeNameById(employeeId)).fullName;
      const supervisorName = (await this.getEmployeeNameById(supervisorId)).fullName;
      return { employeeName, employeeSignature, supervisorName, supervisorSignature };
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  async getEmployeeSignature(_id: string) {
    try {
      return (await this.entityRepository.findOne({ select: ['signatureUrl'], where: { _id } })).signatureUrl;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getCompanyIdByEmployeeId(employeeId: string) {
    return await this.employeeRepository.findOne({ where: { _id: employeeId }, select: ['companyId'] });
  }

  async getAllManagers() {
    return await this.entityRepository.query(`
      SELECT emp._id, get_employee_fullname2(emp._id) fullName FROM employees emp 
      INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
      INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk 
      WHERE sg.salary_grade >= 20 ORDER BY get_employee_fullname2(emp._id) ASC;
    `);
  }

  async getAllManagersForLnd() {
    const managers = await this.entityRepository.query(`
    SELECT employeeId, fullName FROM ((SELECT emp._id employeeId, get_employee_fullname2(emp._id) fullName FROM employees emp 
      INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
      INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk 
    WHERE sg.salary_grade >= 24 ORDER BY get_employee_fullname2(emp._id) ASC)
    UNION (
      SELECT employee_id_fk employeeId, get_employee_fullname2(employee_id_fk) fullName FROM officer_in_charge oic
    )) managers ORDER BY fullName ASC; 
    `);
    return managers;
  }

  async getEmployeePhotoUrl(employeeId: string) {
    try {
      const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, employeeId));
      const { photoUrl } = employeePortalDetails;
      return photoUrl;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getEmployeesByNatureOfAppointmentAndEmployeeId(natureOfAppointment: string, employeeId: string) {
    let empPositions;
    if (employeeId !== null && employeeId !== '' && typeof employeeId !== 'undefined') {
      empPositions = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'employeeId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_fullname2(emp._id)', 'fullName')
        .addSelect('emp.first_name', 'firstName')
        .addSelect('emp.middle_name', 'middleName')
        .addSelect('emp.last_name', 'lastName')
        .addSelect('emp.name_extension', 'nameExt')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp._id', 'positionId')
        .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
        .addSelect('get_employee_assignment_id(emp._id)', 'id')
        .addSelect('get_employee_assignment(emp._id)', 'name')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .orderBy('get_employee_fullname2(emp._id)', 'ASC')
        .where(`pp.position_title<>'Chairman' AND emp._id= :employeeId`, { employeeId })
        .getRawMany();
    } else if (typeof employeeId === 'undefined' && natureOfAppointment !== null && natureOfAppointment !== '') {
      empPositions = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'employeeId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_fullname2(emp._id)', 'fullName')
        .addSelect('emp.first_name', 'firstName')
        .addSelect('emp.middle_name', 'middleName')
        .addSelect('emp.last_name', 'lastName')
        .addSelect('emp.name_extension', 'nameExt')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp._id', 'positionId')
        .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
        .addSelect('get_employee_assignment_id(emp._id)', 'id')
        .addSelect('get_employee_assignment(emp._id)', 'name')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .orderBy('get_employee_fullname2(emp._id)', 'ASC')
        .where(`pp.position_title<>'Chairman' AND nature_of_appointment = :natureOfAppointment`, { natureOfAppointment })
        .getRawMany();
    } else if (typeof employeeId === 'undefined' && natureOfAppointment === '') {
      empPositions = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'employeeId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_fullname2(emp._id)', 'fullName')
        .addSelect('emp.first_name', 'firstName')
        .addSelect('emp.middle_name', 'middleName')
        .addSelect('emp.last_name', 'lastName')
        .addSelect('emp.name_extension', 'nameExt')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp._id', 'positionId')
        .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
        .addSelect('get_employee_assignment_id(emp._id)', 'id')
        .addSelect('get_employee_assignment(emp._id)', 'name')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .orderBy('get_employee_fullname2(emp._id)', 'ASC')
        .where(`pp.position_title<>'Chairman'`, {})
        .getRawMany();
    }

    const _empPositions = await Promise.all(
      empPositions.map(async (empPosition) => {
        const { id, name, userId, companyId, fullName, firstName, middleName, lastName, positionTitle, nameExt, employeeId, natureOfAppointment, positionId } = empPosition;
        let avatarUrl = null;
        const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];

        const employeeSchedule = await lastValueFrom(this.clientEms.send('get_employee_schedule', employeeId));

        try {
          const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, employeeId));
          const { photoUrl } = employeePortalDetails;
          avatarUrl = photoUrl;
        } catch {
          avatarUrl = null;
        }
        return {
          employmentDetails: {
            employeeId,
            userId,
            companyId,
            positionTitle,
            assignment: { id, name, divisionName, departmentName, officeName },
            positionId,
            scheduleBase: employeeSchedule.schedule.scheduleBase,
            natureOfAppointment,
            avatarUrl,
          },
          personalDetails: { fullName, firstName, middleName, lastName, nameExt },
        };
      }),
    );
    return _empPositions;
  }

  async getEmployeeSchedule(employeeId: string) {
    try {
      const employeeSchedule = await this.entityRepository.query(
        `
        SELECT 
           s.schedule_id id,
           s.name scheduleName, 
           s.schedule_type scheduleType, 
           s.time_in timeIn,
           s.lunch_out lunchOut,
           s.lunch_in lunchIn, 
           s.time_out timeOut, 
           s.shift shift,
           s.schedule_base scheduleBase,
           DATE_FORMAT(emr.date_from,'%Y-%m-%d') dateFrom,
           DATE_FORMAT(emr.date_to,'%Y-%m-%d') dateTo,
           GROUP_CONCAT(emrs.rest_day SEPARATOR ', ') restDaysNumbers,
           GROUP_CONCAT(employee_monitoring.get_weekday((emrs.rest_day - 1)) SEPARATOR ', ') restDaysNames 
       FROM employee_monitoring.employee_schedule es 
       INNER JOIN employee_monitoring.schedule s ON s.schedule_id = es.schedule_id_fk 
       LEFT JOIN employee_monitoring.employee_rest_day emr ON emr.employee_id_fk = es.employee_id_fk 
       INNER JOIN employee_monitoring.employee_rest_days emrs ON emr.employee_rest_day_id = emrs.employee_rest_day_id_fk  
       WHERE emr.employee_id_fk = ? GROUP BY s.schedule_id,es.created_at,dateFrom,dateTo ORDER BY DATE_FORMAT(emr.date_from,'%Y-%m-%d') 
       DESC LIMIT 1
 `,
        [employeeId],
      );
      return employeeSchedule.length > 0 ? employeeSchedule[0] : null;
    } catch (error) {
      return null;
    }
  }

  async getEmployeePhotoUrlFromPortal(employeeId: string) {
    try {
      const photoUrl = await this.entityRepository.query(
        `
        SELECT photo_url photoUrl FROM ${process.env.PORTAL_DB_NAME}employees WHERE user_id_fk = ?;
        `,
        [employeeId],
      );
      console.log(photoUrl);
      return photoUrl.length > 0 ? photoUrl[0].photoUrl : null;
    } catch (error) {
      return null;
    }
  }

  async getAllEmployees() {
    try {
      const empPositions = await this.employeeRepository
        .createQueryBuilder('emp')
        .select('emp._id', 'employeeId')
        .addSelect('emp.company_id', 'companyId')
        .addSelect('get_employee_fullname2(emp._id)', 'fullName')
        .addSelect('emp.first_name', 'firstName')
        .addSelect('emp.middle_name', 'middleName')
        .addSelect('emp.last_name', 'lastName')
        .addSelect('emp.name_extension', 'nameExt')
        .addSelect('pp.position_title', 'positionTitle')
        .addSelect('pp._id', 'positionId')
        .addSelect('pp.nature_of_appointment', 'natureOfAppointment')
        .addSelect('get_employee_assignment_id(emp._id)', 'id')
        .addSelect('get_employee_assignment(emp._id)', 'name')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .orderBy('get_employee_fullname2(emp._id)', 'ASC')
        .where(`pp.position_title<>'Chairman'`, {})
        .getRawMany();

      const _empPositions = await Promise.all(
        empPositions.map(async (empPosition) => {
          const { id, name, userId, companyId, fullName, firstName, middleName, lastName, positionTitle, nameExt, employeeId, natureOfAppointment, positionId } = empPosition;

          const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];
          const employeeSchedule = await this.getEmployeeSchedule(employeeId);

          const avatarUrl = await this.getEmployeePhotoUrlFromPortal(employeeId);

          return {
            employmentDetails: {
              employeeId,
              userId,
              companyId,
              positionTitle,
              assignment: { id, name, divisionName, departmentName, officeName },
              positionId,
              scheduleBase: employeeSchedule.scheduleBase,
              natureOfAppointment,
              avatarUrl,
            },
            personalDetails: { fullName, firstName, middleName, lastName, nameExt },
          };
        }),
      );
      return _empPositions;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getAllPermanentCasualEmployees() {
    return await this.entityRepository.query(
      `SELECT get_employee_fullname(emp._id) label,emp._id value FROM employees emp 
        INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
        INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk  
       WHERE pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent' 
       AND sg.salary_grade <= 27
       ORDER BY get_employee_fullname(emp._id) ASC;`,
    );
  }

  async getAllAssignableSupervisorEmployeesByEmployeeId(employeeId: string) {
    return (await this.entityRepository.query(`CALL sp_get_assignable_supervisors(?);`, [employeeId]))[0];
  }

  async getAllAssignableSupervisoryEmployees() {
    return await this.entityRepository.query(`
      SELECT get_employee_fullname(emp._id) label,emp._id value FROM employees emp 
        INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
        INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk  
      WHERE (pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent') 
      AND sg.salary_grade >= 16 
      ORDER BY get_employee_fullname(emp._id) ASC;
    `);
  }

  async getAllPermanentCasualEmployees2() {
    return (await this.entityRepository.query(
      `SELECT get_employee_fullname2(emp._id) label,emp._id value 
       FROM employees emp INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id WHERE pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent' ORDER BY get_employee_fullname2(emp._id) ASC;`,
    )) as { label: string; value: string }[];
  }

  async getAllAssignablePermanentCasualEmployees(employeeIds: string[]) {
    if (employeeIds.length > 0)
      return await this.entityRepository.query(
        `SELECT get_employee_fullname2(emp._id) label,emp._id value FROM employees emp 
                INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id 
        WHERE pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent' AND 
        emp._id NOT IN (?) ORDER BY get_employee_fullname2(emp._id) ASC;`,
        [employeeIds],
      );
    return await this.getAllPermanentCasualEmployees2();
  }

  async findEmailAddress(email: string) {
    try {
      return await lastValueFrom(this.clientAuthn.send({ msg: 'find_user_email' }, email));
    } catch (error) {
      return null;
    }
  }

  async findEmailAddressById(employeeId: string) {
    try {
      return await lastValueFrom(this.clientAuthn.send({ msg: 'find_email_by_employee_id' }, employeeId));
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async findTempEmailAddress(email: string) {
    try {
      return await lastValueFrom(this.clientAuthn.send({ msg: 'find_pending_email' }, email));
    } catch (error) {
      //throw new HttpException('Email address already exists', HttpStatus.BAD_REQUEST);
      return null;
    }
  }

  private async createTempEmailAddress(email: string) {
    try {
      return await lastValueFrom(this.clientAuthn.send({ msg: 'create_pending_email' }, { email }));
    } catch (error) {
      //throw new HttpException('Email address already exists', HttpStatus.BAD_REQUEST);
      return null;
    }
  }

  async addEmployeeWithRegisterLink(employeeDto: EmployeeDTO) {
    //
    try {
      const position = await this.plantillaPositionsService.entityRepository.findOne({
        where: { _id: employeeDto.positionId },
      });
      if (!position) throw new HttpException('Position does not exists.', HttpStatus.BAD_REQUEST);

      const { email, restDays, applicantId, scheduleId, ...restOfEmployeeDTO } = employeeDto;
      const { _id, ...rest } = position;

      //4. Get salary grade of position
      const salaryGrade = (await this.plantillaPositionsService.entityRepository.query('SELECT get_plantilla_salary_grade(?) salaryGrade;', [employeeDto.positionId]))[0]
        .salaryGrade;
      const companyId = (await this.plantillaPositionsService.entityRepository.query('SELECT generate_company_id() companyId;', []))[0].companyId;

      const role = this.getUserRole(parseInt(salaryGrade));
      //5. Save employee
      const employee = await this.saveEntity({ ...restOfEmployeeDTO, companyId, userRole: role });
      //5.1 Add employee default schedule
      const schedule = await lastValueFrom(this.clientEms.send('add_employee_schedule', { employeeId: employee._id, scheduleId, restDays, dateFrom: null, dateTo: null }));
      //6. Assign Employee to plantilla
      const { firstName, middleName, lastName, nameExtension } = restOfEmployeeDTO;

      const updatedPosition = await this.plantillaPositionsService.updateEntity({
        _id,
        employeeId: employee._id,
        //...rest,
      });

      //7. Send Email to Employee Portal User
      const emailResult = await this.emailService.sendEmail(employeeDto.email, employee._id, salaryGrade, {
        companyId,
        firstName,
        middleName,
        lastName,
        nameExt: nameExtension,
      });

      return {
        createdUser: employee,
        updatedPosition,
        email: emailResult,
        schedule,
      };
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getEmployeeSupervisor(employeeId: string, isRpc?: boolean) {
    try {
      return (
        await this.entityRepository.query(`SELECT get_employee_supervisor(?) supervisorId, get_employee_fullname(get_employee_supervisor(?)) employeeName`, [
          employeeId,
          employeeId,
        ])
      )[0].supervisorId;
    } catch (error) {
      if (isRpc) throw new RpcException(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getEmployeeSupervisorEms(employeeId: string, isRpc?: boolean) {
    try {
      return (
        await this.entityRepository.query(`SELECT get_employee_supervisor(?) supervisorId, get_employee_fullname(get_employee_supervisor_ems(?)) employeeName`, [
          employeeId,
          employeeId,
        ])
      )[0].supervisorId;
    } catch (error) {
      if (isRpc) throw new RpcException(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getAllEmployeeNames() {
    return await this.entityRepository.query(`SELECT _id employeeId, get_employee_fullname(_id) fullName, get_employee_position_or_oic(_id) positionTitle FROM employees;`);
  }

  async getEmployeesByNameMatch(name: string) {
    return await this.entityRepository.query(
      `SELECT _id employeeId, get_employee_fullname(_id) fullName,get_employee_position_or_oic(_id) positionTitle FROM employees WHERE get_employee_fullname(_id) LIKE CONCAT('%',?,'%') ORDER BY get_employee_fullname(_id) ASC;`,
      [name],
    );
  }

  async getAllRegularEmployeeIds() {
    try {
      const employeeIds = await this.entityRepository.query(
        `SELECT emp._id employeeId,emp.company_id companyId FROM employees emp INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id WHERE user_role IN ('rank_and_file','division_manager','department_manager','general_manager','assistant_general_manager') AND company_id IS NOT NULL AND company_id <> '';`,
      );

      return employeeIds;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getMonthHourlyRateByEmployeeId(employeeId: string) {
    try {
      const monthlyRate = await this.entityRepository.query(
        `
        SELECT 
          amount, 
          concat(sg.salary_grade, '-',sg.step_increment) salaryGrade,
          sg.salary_grade salaryGradeLevel,
          sg.step_increment stepIncrement,
          pp.daily_rate dailyRate
        FROM salary_grade sg 
          RIGHT JOIN plantilla_positions pp ON pp.salary_grade_id_fk = sg._id
          INNER JOIN employees e ON e._id = pp.employee_id_fk WHERE e._id = ?;`,
        [employeeId],
      );

      if (typeof monthlyRate[0] !== 'undefined') {
        const hourlyRate = parseFloat((monthlyRate[0].amount / 22 / 8).toFixed(2));
        return {
          monthlyRate: monthlyRate[0].amount,
          hourlyRate,
          salaryGrade: monthlyRate[0].salaryGrade,
          salaryGradeLevel: monthlyRate[0].salaryGradeLevel,
          stepIncrement: monthlyRate[0].stepIncrement,
          dailyRate: monthlyRate[0].dailyRate,
        };
      } else return { monthlyRate: null, hourlyRate: null, salaryGrade: null, salaryGradeLevel: null, stepIncrement: null, dailyRate: null };
    } catch (error) {
      console.log(error);
      return { monthlyRate: null, hourlyRate: null, salaryGrade: null, salaryGradeLevel: null, stepIncrement: null, dailyRate: null };
    }
  }

  async getSalaryGradeIdOrDailyRateByEmployeeId(employeeId: string) {
    return (
      await this.entityRepository.query(
        `
      SELECT amount salaryGradeAmount, daily_rate dailyRate FROM plantilla_positions pp 
          LEFT JOIN salary_grade sg ON pp.salary_grade_id_fk = sg._id
      WHERE employee_id_fk = ?`,
        [employeeId],
      )
    )[0];
  }

  async getEmployeeNatureOfAppointment(employeeId: string) {
    try {
      return (
        await this.entityRepository.query(
          `
      SELECT DISTINCT pp.nature_of_appointment natureOfAppointment 
        FROM plantilla_positions pp 
      WHERE pp.employee_id_fk = ?;`,
          [employeeId],
        )
      )[0].natureOfAppointment;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  async getSubordinates(employeeId: string) {
    return (await this.entityRepository.query(`CALL sp_get_employees_under_manager(?);`, [employeeId]))[0];
  }

  async getSubordinatesWithCompanyId(employeeId: string) {
    return (await this.entityRepository.query(`CALL sp_get_employees_with_company_id_under_manager(?);`, [employeeId]))[0];
  }

  async isGeneralManager(employeeId: string) {
    try {
      const { isGeneralManager } = (await this.entityRepository.query(`SELECT is_general_manager(?) isGeneralManager;`, [employeeId]))[0];
      if (isGeneralManager === 1) return true;
      return false;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  private getUserRole(salaryGrade: number) {
    if (salaryGrade < 24) return UserRole.RANK_AND_FILE;
    else if (salaryGrade === 24) return UserRole.DIVISION_MANAGER;
    else if (salaryGrade === 26) return UserRole.DEPARTMENT_MANAGER;
    else if (salaryGrade === 27) return UserRole.ASSISTANT_GENERAL_MANAGER;
    else if (salaryGrade === 28) return UserRole.GENERAL_MANAGER;
    else if (salaryGrade === 0) return UserRole.BOARD_MEMBER;
  }

  /* find employee details by plantilla id */
  async getEmployeeDetailsByPlantillaId(plantillaId: string) {
    try {
      const plantilla = await this.entityRepository.query(
        `select em._id employeeId, get_employee_fullname(em._id) fullName, em.company_id companyId, pp.nature_of_appointment natureOfAppointment from plantilla_positions pp left join employees em on pp.employee_id_fk = em._id where pp._id = ?`,
        [plantillaId],
      );

      const photoUrl = (await this.getEmployeePortalDetails(plantilla[0].employeeId)).photoUrl;

      return {
        photoUrl: photoUrl,
        name: plantilla[0].fullName,
        companyId: plantilla[0].companyId,
        natureOfAppointment: plantilla[0].natureOfAppointment,
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async getEmployeePosition(employeeId: string) {
    try {
      const result = await this.entityRepository.query(`SELECT _id id, position_title positionTitle FROM plantilla_positions WHERE employee_id_fk = ?;`, [employeeId]);
      if (result.length === 0) return null;
      return result[0];
    } catch (error) {
      return null;
    }
  }

  async generateReportOnEmployeeDetails(employeeDetailsFilter: {
    companyId: boolean;
    employeeId: string;
    natureOfAppointment: NatureOfAppointment;
    personalDetails: boolean;
    gsis: boolean;
    pagibig: boolean;
    sss: boolean;
    tin: boolean;
    residentialAddress: boolean;
    permanentAddress: boolean;
    primaryEducation: boolean;
    secondaryEducation: boolean;
    vocationalCourse: boolean;
    collegeEducation: boolean;
    graduateStudies: boolean;
    eligibility: boolean;
    dateHired: boolean;
    philhealth: boolean;
    assignment: boolean;
    office: boolean;
    department: boolean;
    division: boolean;
    positionTitle: boolean;
    salaryGrade: boolean;
    amount: boolean;
  }) {
    return await lastValueFrom(this.clientAuthn.send({ msg: 'generate_report_on_employee_details' }, employeeDetailsFilter));
  }

  async getHrdManager() {
    return (
      await this.entityRepository.query(`
    SELECT employeeId FROM 
    ((SELECT pp.employee_id_fk employeeId FROM plantilla_positions pp 
      INNER JOIN department_positions dp ON dp.position_id_fk = pp._id 
      INNER JOIN departments d ON dp.department_id_fk = d._id 
    WHERE pp.position_title = 'Department Manager A' AND d.name = 'Human Resource Department') 
    UNION
    (
      SELECT employeeId FROM officer_in_charge_view 
      WHERE oicOrgName = 'Human Resource Department' AND oicPosition = 'OIC-Department Manager'
    )) hrdManagers WHERE employeeId IS NOT NULL;`)
    )[0].employeeId;
  }

  async getTddManager() {
    return (
      await this.entityRepository.query(`
    SELECT employeeId FROM 
    ((SELECT pp.employee_id_fk employeeId FROM plantilla_positions pp 
      INNER JOIN division_positions dp ON dp.position_id_fk = pp._id 
      INNER JOIN divisions d ON dp.division_id_fk = d._id 
    WHERE pp.position_title = 'Division Manager A' AND d.name = 'Training and Development Division') 
    UNION
    (
      SELECT employeeId FROM officer_in_charge_view 
      WHERE oicOrgName = 'Training and Development Division' AND oicPosition = 'OIC-Division Manager'
    )) hrdManagers WHERE employeeId IS NOT NULL;`)
    )[0].employeeId;
  }

  async getGeneralManager() {
    return (
      await this.entityRepository.query(`
    SELECT employeeId FROM 
    ((SELECT pp.employee_id_fk employeeId FROM plantilla_positions pp 
      INNER JOIN office_positions op ON op.position_id_fk = pp._id 
      INNER JOIN office o ON op.office_id_fk = o._id 
    WHERE pp.position_title = 'General Manager' AND o.name = 'Office of the General Manager') 
    UNION
    (
      SELECT employeeId FROM officer_in_charge_view 
      WHERE oicOrgName = 'Office of the General Manager' AND oicPosition = 'OIC-General Manager'
    )) hrdManagers WHERE employeeId IS NOT NULL;`)
    )[0].employeeId;
  }

  /**
   * @author RV
   * @description Get Employee list by nature of appointment
   * @returns array { employeeId: string, fullName: string }[]
   */
  async getEmployeesByNatureOfAppointment(natureOfAppointment: NatureOfAppointment) {
    try {
      return await this.entityRepository.query(
        `
        SELECT distinct employee_id_fk employeeId,get_employee_fullname2(employee_id_fk) fullName 
          FROM plantilla_positions WHERE nature_of_appointment = ? AND employee_id_fk IS NOT NULL 
        ORDER BY get_employee_fullname2(employee_id_fk) ASC;`,
        [natureOfAppointment],
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getEmployeesByNatureOfAppointmentAndEmployeeIdRange(natureOfAppointment: NatureOfAppointment, employeeIds: string[]) {
    try {
      return await this.entityRepository.query(
        `
        SELECT distinct employee_id_fk employeeId,get_employee_fullname2(employee_id_fk) fullName 
          FROM plantilla_positions WHERE nature_of_appointment = ? AND employee_id_fk IN (?) AND employee_id_fk IS NOT NULL 
        ORDER BY get_employee_fullname2(employee_id_fk) ASC;`,
        [natureOfAppointment, employeeIds],
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  /**
   * @author RV
   * @param includeGm boolean
   * @description used for getting training certification signatories
   */
  async getSignatoriesForTrainingCertification(includeGm: boolean) {
    const hrdManagerId = await this.getHrdManager();
    const hrdDetails = await this.getEmployeeDetailsWithSignatureByEmployeeId(hrdManagerId);

    const tddManagerId = await this.getTddManager();
    const tddDetails = await this.getEmployeeDetailsWithSignatureByEmployeeId(tddManagerId);

    const gmId = await this.getGeneralManager();
    const gmDetails = await this.getEmployeeDetailsWithSignatureByEmployeeId(gmId);

    return {
      tddMgr: {
        name: tddDetails.employeeFullName,
        signature: tddDetails.signatureUrl,
        position: tddDetails.assignment.positionTitle === 'OIC-Division Manager' ? 'Acting Division Manager' : tddDetails.assignment.positionTitle,
      },
      hrdMgr: {
        name: hrdDetails.employeeFullName,
        signature: hrdDetails.signatureUrl,
        position: hrdDetails.assignment.positionTitle === 'OIC-Department Manager' ? 'Acting Department Manager' : hrdDetails.assignment.positionTitle,
      },
      gm: includeGm
        ? {
            name: gmDetails.employeeFullName,
            signature: hrdDetails.signatureUrl,
            position: gmDetails.assignment.positionTitle === 'OIC-General Manager' ? 'Acting General Manager' : gmDetails.assignment.positionTitle,
          }
        : null,
    };
  }

  /**
   * @dateCreated 2025-02-25
   * @description this function is used for updating Employee's (Name, Title Prefix/Suffix, Birthday, Sex)
   * @param updateBasicEmployeeInfoDto
   * @author RV
   * @returns Promise<BasicEmployeeInfo>
   */
  async updateBasicEmployeeInfo(updateBasicEmployeeInfoDto: UpdateBasicEmployeeInfoDto) {
    try {
      const { dailyRate, email, employeeId, firstName, lastName, middleName, nameExtension, phoneNumber, sex, birthday, titlePrefix, titleSuffix } = updateBasicEmployeeInfoDto;
      await this.entityRepository.manager.transaction(async (transactionalEntityManager) => {
        //Update Employee details in RSP
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Employees)
          .set({
            firstName,
            middleName,
            lastName,
            nameExtension,
            titlePrefix,
            titleSuffix,
          })
          .where('_id=:employeeId', { employeeId })
          .execute();

        //Update Employee daily rate in RSP
        await transactionalEntityManager
          .createQueryBuilder()
          .update(PlantillaPositions)
          .set({
            dailyRate: dailyRate.toString() === '' ? null : dailyRate,
          })
          .where('employee_id_fk = :employeeId', { employeeId })
          .execute();

        //Update Employee Details in Portal
        await transactionalEntityManager.query(
          `
          UPDATE ${process.env.PORTAL_DB_NAME}employees SET 
            first_name=?, middle_name=?, last_name=?, name_ext=?, sex=?, birth_date=?,mobile_number=?,email_address=? WHERE 
          user_id_fk=?;
        `,
          [firstName, middleName, lastName, nameExtension, sex, birthday, phoneNumber, email, employeeId],
        );

        //Update Employee Username(email) in Portal
        await transactionalEntityManager.query(`UPDATE ${process.env.PORTAL_DB_NAME}users SET email=? WHERE user_id=?`, [email, employeeId]);
      });
      return updateBasicEmployeeInfoDto;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @dateCreated 2025-02-25
   * @description this function is used for fetching Employee's (Name, Title Prefix/Suffix, Birthday, Sex)
   * @param employeeId
   * @author RV
   * @returns Promise<BasicEmployeeInfo>
   */
  async getBasicEmployeeInfo(employeeId: string) {
    try {
      const employee = await this.employeeRepository.query(
        `
        SELECT 
            h_emp._id employeeId, 
            h_emp.first_name firstName, 
            h_emp.middle_name middleName, 
            h_emp.last_name lastName, 
            h_emp.name_extension nameExtension, 
            h_emp.title_prefix titlePrefix,
            h_emp.title_suffix titleSuffix,
            p_emp.sex sex,
            p_emp.mobile_number phoneNumber,
            p_emp.email_address email,
            DATE_FORMAT(p_emp.birth_date,'%Y-%m-%d') birthday,
            pp.daily_rate dailyRate
        FROM employees h_emp 
          INNER JOIN portal.employees p_emp ON h_emp._id = p_emp.user_id_fk
          INNER JOIN plantilla_positions pp ON pp.employee_id_fk = h_emp._id
        WHERE h_emp._id = ?;`,
        [employeeId],
      );
      return employee.length > 0 ? employee[0] : null;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
