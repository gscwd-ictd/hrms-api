import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { EmailService } from 'src/global/auth/services/email.service';
import { EmployeeDTO, UpdateBasicEmployeeInfoDto } from 'src/core/employees/data/dtos/employee.dto';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { EntityManager, Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { UserRole } from '../users/utils/enums/role.enum';
import { OfficerInChargeViewService } from '../officer-in-charge/data/officer-in-charge-view/officer-in-charge-view.service';
import { CommitteeMembersService } from '../committee-members/committee-members.service';
import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';
import { PlantillaPositions } from '../plantilla-positions/data/entities/plantilla-positions.entity';
import { BasicEmployeeInfo } from './utils/employee.type';
import { NosiNosaStatus } from 'src/core/salary-grade/utils/types/salary-grade.type';
import { randomUUID } from 'crypto';
import * as argon from 'argon2';
import {
  defaultPortalPassword,
  initialCasualLeaveCredits,
  nextCompanyId,
  RegisterCasualJobOrderDto,
  validateRegistration,
} from './utils/casual-job-order-registration.util';

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
    return await this.emailService.sendEmail('allynjosephcubero@gmail.com', '62fef63c-b26f-11ed-a79b-000c29f95a80', 1, null);
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
      throw new HttpException(error.message, error.status);
    }
  }

  async getAllEmployeesWithSupervisor() {
    let _employeeId;
    let _employeeDetails;
    try {
      const employeeList = await this.getAllEmployeesForMS();
      const employees = await Promise.all(
        employeeList.map(async (emp) => {
          const { value } = emp;
          _employeeId = value;
          const employeeDetails = await this.getEmployeeDetailsByEmployeeId(value);
          _employeeDetails = employeeDetails;
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
      console.log(employees);
      return employees;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async getAllPermanentCasualEmployeesWithSupervisor() {
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
      console.log(employees);
      return employees;
    } catch (error) {
      throw new HttpException(error.message, error.status);
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
        scheduleBase: employeeSchedule ? employeeSchedule.scheduleBase : null,
        userRole,
      };
    } catch (error) {
      console.log(error.message);
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
    let _employeeId = '';
    let _supervisorId = '';
    try {
      const { employeeId, supervisorId } = ids;
      _employeeId = employeeId;
      _supervisorId = supervisorId;
      const employeeSignature = await this.getEmployeeSignature(employeeId);
      const supervisorSignature = await this.getEmployeeSignature(supervisorId);
      const employeeName = (await this.getEmployeeNameById(employeeId)).fullName;
      const supervisorName = (await this.getEmployeeNameById(supervisorId)).fullName;
      return { employeeName, employeeSignature, supervisorName, supervisorSignature };
    } catch (error) {
      console.log(_employeeId, ' ', _supervisorId);
      console.log(error);
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

  /**
   * Managers (SG 24 and up) and officers-in-charge who can receive L&D slot distributions.
   * Excludes separated employees: latest NOSI/NOSA record is 'inactive' (retirement, resignation, death, ...)
   * with an effectivity date on or before today.
   */
  async getAllManagersForLnd() {
    const managers = await this.entityRepository.query(`
    SELECT employeeId, fullName FROM ((SELECT emp._id employeeId, get_employee_fullname2(emp._id) fullName FROM employees emp 
      INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
      INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk 
    WHERE sg.salary_grade >= 24 ORDER BY get_employee_fullname2(emp._id) ASC)
    UNION (
      SELECT employee_id_fk employeeId, get_employee_fullname2(employee_id_fk) fullName FROM officer_in_charge oic
    )) managers
    WHERE NOT EXISTS (
      SELECT 1 FROM nosi_nosa nn
       WHERE nn.employee_id_fk = managers.employeeId
         AND nn.status = 'inactive'
         AND nn.effectivity_date <= CURDATE()
         AND nn.effectivity_date = (SELECT MAX(nn2.effectivity_date) FROM nosi_nosa nn2 WHERE nn2.employee_id_fk = managers.employeeId)
    )
    ORDER BY fullName ASC;
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
        .addSelect('is_ta(emp._id)', 'isTa')
        .addSelect(`if(is_ta(emp._id)=1,get_actual_employee_assignment(emp._id),'N/A')`, 'actualAssignment')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .orderBy('get_employee_fullname2(emp._id)', 'ASC')
        .where(`pp.position_title<>'Chairman'`, {})
        .andWhere(
          `NOT EXISTS (
          SELECT 1 FROM nosi_nosa nn
          WHERE nn.employee_id_fk = emp._id
          AND nn.status = 'inactive'
        )`,
        )
        .getRawMany();

      const _empPositions = await Promise.all(
        empPositions.map(async (empPosition) => {
          const {
            id,
            name,
            userId,
            companyId,
            fullName,
            firstName,
            middleName,
            lastName,
            positionTitle,
            nameExt,
            employeeId,
            natureOfAppointment,
            positionId,
            isTa,
            actualAssignment,
          } = empPosition;

          const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];
          const employeeSchedule = await this.getEmployeeSchedule(employeeId);
          const avatarUrl = await this.getEmployeePhotoUrlFromPortal(employeeId);

          return {
            employmentDetails: {
              employeeId,
              userId,
              companyId,
              positionTitle,
              assignment: { id, name, divisionName, departmentName, officeName, isTa, actualAssignment },
              positionId,
              scheduleBase: employeeSchedule ? employeeSchedule.scheduleBase : null,
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

  /**
   * @description Returns all employees who have at least one nosi_nosa record
   * with status = 'inactive'. A single inactive nosi_nosa entry, at any
   * effectivity_date, permanently marks the employee as inactive here —
   * a later non-inactive entry does not reverse it.
   */
  async getAllInactiveEmployees() {
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
        .addSelect('is_ta(emp._id)', 'isTa')
        .addSelect(`if(is_ta(emp._id)=1,get_actual_employee_assignment(emp._id),'N/A')`, 'actualAssignment')
        .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
        .orderBy('get_employee_fullname2(emp._id)', 'ASC')
        .where(`pp.position_title<>'Chairman'`, {})
        .andWhere(
          `EXISTS (
            SELECT 1 FROM nosi_nosa nn
            WHERE nn.employee_id_fk = emp._id
            AND nn.status = :inactiveStatus
          )`,
          { inactiveStatus: NosiNosaStatus.INACTIVE },
        )
        .getRawMany();

      const _empPositions = await Promise.all(
        empPositions.map(async (empPosition) => {
          const {
            id,
            name,
            userId,
            companyId,
            fullName,
            firstName,
            middleName,
            lastName,
            positionTitle,
            nameExt,
            employeeId,
            natureOfAppointment,
            positionId,
            isTa,
            actualAssignment,
          } = empPosition;

          const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];
          const employeeSchedule = await this.getEmployeeSchedule(employeeId);

          const avatarUrl = await this.getEmployeePhotoUrlFromPortal(employeeId);

          return {
            employmentDetails: {
              employeeId,
              userId,
              companyId,
              positionTitle,
              assignment: { id, name, divisionName, departmentName, officeName, isTa, actualAssignment },
              positionId,
              scheduleBase: employeeSchedule ? employeeSchedule.scheduleBase : null,
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

  async getAllEmployeesForMS() {
    return await this.entityRepository.query(`
      SELECT get_employee_fullname(emp._id) label,emp._id value FROM employees emp
        INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
      WHERE 
      pp.nature_of_appointment = 'casual' 
      OR pp.nature_of_appointment = 'permanent' 
      OR pp.nature_of_appointment = 'job order'
      ORDER BY get_employee_fullname(emp._id) ASC;`);
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
      `SELECT get_employee_fullname2(emp._id) label, emp._id value
        FROM employees emp
        INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
        WHERE (pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent')
        AND company_id NOT IN ('2008-005','2021-002','2017-031','2022-002','2020-007','2007-003','2000-001','2013-006','2002-002','2021-022','2017-013','1989-002','1998-002')
        ORDER BY get_employee_fullname2(emp._id) ASC;`,
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

  /**
   * Registers a Casual or Job Order employee (HR 2026-11-11), in one transaction:
   *  hris_prod:   employees (Employee No. = year-sequence), plantilla_positions (title, nature, daily rate),
   *               office/department/division_positions (designation), nosi_nosa (Job Order: 'active' + daily rate; Casual: 'approved nosa' + salary grade)
   *  portal_prod: users (login: email + default password '@' + first name + employee no.), employees (profile)
   *  employee_monitoring (Casual only): leave credits - Beginning Balance + FL 5, VL 0, SL 0, SPL 3, Wellness by months left
   * The work schedule is set in EMS as usual.
   */
  /**
   * Casual leave credits in employee_monitoring.leave_credit_earnings (Beginning Balance + initial credits).
   * Skipped when the employee already has a Beginning Balance for that year.
   */
  private async addInitialCasualLeaveCredits(manager: EntityManager, employeeId: string, effectivityDate: string) {
    const ems = process.env.EMS_DB_NAME ?? 'employee_monitoring.';
    const [{ n }] = await manager.query(
      `SELECT COUNT(*) n FROM ${ems}leave_credit_earnings WHERE employee_id_fk = ? AND remarks = 'Beginning Balance' AND YEAR(credit_date) = ? AND deleted_at IS NULL;`,
      [employeeId, effectivityDate.slice(0, 4)],
    );
    if (Number(n) > 0) return [];
    const rows = initialCasualLeaveCredits(effectivityDate);
    for (const row of rows) {
      await manager.query(
        `INSERT INTO ${ems}leave_credit_earnings (leave_credit_earnings_id, employee_id_fk, credit_date, credit_value, leave_benefits_id_fk, remarks) VALUES (?, ?, ?, ?, ?, ?);`,
        [randomUUID(), employeeId, row.creditDate, row.creditValue, row.leaveBenefitsId, row.remarks],
      );
    }
    return rows;
  }

  async registerCasualJobOrder(dto: RegisterCasualJobOrderDto) {
    const problem = validateRegistration(dto);
    if (problem) throw new HttpException(problem, HttpStatus.BAD_REQUEST);

    const portal = process.env.PORTAL_DB_NAME ?? '';
    const email = (dto.email ?? '').trim().toLowerCase();
    const isJobOrder = dto.natureOfAppointment === 'job order';
    const dailyRate = isJobOrder ? Number(dto.dailyRate) : null;
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const effectivityDate = dto.effectivityDate || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const nullIfBlank = (v?: string) => (v && v.trim() !== '' ? v.trim() : null);

    return await this.entityRepository.manager.transaction(async (manager) => {
      // one registration at a time, so two HR users cannot get the same Employee No.
      const [{ locked }] = await manager.query(`SELECT GET_LOCK('hrms:register-employee', 10) locked;`);
      if (Number(locked) !== 1) throw new HttpException('Another registration is in progress. Please try again.', HttpStatus.CONFLICT);
      try {
        // designation: which org table the selected id belongs to
        const [org] = await manager.query(
          `SELECT 'office' type FROM office WHERE _id = ?
           UNION ALL SELECT 'department' FROM departments WHERE _id = ?
           UNION ALL SELECT 'division' FROM divisions WHERE _id = ?;`,
          [dto.orgId, dto.orgId, dto.orgId],
        );
        if (!org) throw new HttpException('Office / department / division not found.', HttpStatus.BAD_REQUEST);
        const orgTable = { office: ['office_positions', 'office_id_fk'], department: ['department_positions', 'department_id_fk'], division: ['division_positions', 'division_id_fk'] }[
          org.type as 'office' | 'department' | 'division'
        ];

        // Casual: salary grade row (SG + step) of the effectivity year (latest table on or before it)
        let salaryGradeId: number | null = null;
        if (dto.natureOfAppointment === 'casual') {
          const [sgRow] = await manager.query(
            `SELECT _id FROM salary_grade WHERE salary_grade = ? AND step_increment = ? AND effectivity_year <= ?
              ORDER BY effectivity_year DESC LIMIT 1;`,
            [Number(dto.salaryGrade), Number(dto.stepIncrement), Number(effectivityDate.slice(0, 4))],
          );
          if (!sgRow) throw new HttpException(`Salary grade ${dto.salaryGrade} step ${dto.stepIncrement} is not in the salary grade table.`, HttpStatus.BAD_REQUEST);
          salaryGradeId = sgRow._id;
        }

        // Casual from an existing Job Order employee: new Casual position, the Job Order position is vacated;
        // Employee No. and Employee Portal account stay the same
        if (dto.existingEmployeeId) {
          const [current] = await manager.query(
            `SELECT e.company_id companyId, pp._id positionId, pp.nature_of_appointment nature,
                    (SELECT n.status FROM nosi_nosa n WHERE n.employee_id_fk = e._id AND n.effectivity_date <= CURDATE()
                      ORDER BY n.effectivity_date DESC, n.created_at DESC LIMIT 1) latestStatus
               FROM employees e LEFT JOIN plantilla_positions pp ON pp.employee_id_fk = e._id
              WHERE e._id = ?;`,
            [dto.existingEmployeeId],
          );
          if (!current) throw new HttpException('Employee not found.', HttpStatus.NOT_FOUND);
          if (current.nature !== 'job order') throw new HttpException('The selected employee is not a Job Order employee.', HttpStatus.BAD_REQUEST);
          if (current.latestStatus === 'inactive') throw new HttpException('The selected employee is already separated.', HttpStatus.BAD_REQUEST);

          const casualPositionId = randomUUID();
          await manager.query(`UPDATE plantilla_positions SET employee_id_fk = NULL WHERE _id = ?;`, [current.positionId]);
          await manager.query(
            `INSERT INTO plantilla_positions (_id, position_title, nature_of_appointment, employee_id_fk, salary_grade_id_fk) VALUES (?, ?, 'casual', ?, ?);`,
            [casualPositionId, dto.positionTitle.trim(), dto.existingEmployeeId, salaryGradeId],
          );
          await manager.query(`INSERT INTO ${orgTable[0]} (_id, position_id_fk, ${orgTable[1]}) VALUES (?, ?, ?);`, [randomUUID(), casualPositionId, dto.orgId]);
          await manager.query(`UPDATE employees SET user_role = ? WHERE _id = ?;`, [UserRole.RANK_AND_FILE, dto.existingEmployeeId]);
          await manager.query(
            `INSERT INTO nosi_nosa (_id, effectivity_date, status, employee_id_fk, position_id_fk, actual_salary_grade_id_fk, adjusted_salary_grade_id_fk, is_per_piece)
             VALUES (?, ?, 'approved nosa', ?, ?, ?, ?, 0);`,
            [randomUUID(), effectivityDate, dto.existingEmployeeId, casualPositionId, salaryGradeId, salaryGradeId],
          );
          const leaveCredits = await this.addInitialCasualLeaveCredits(manager, dto.existingEmployeeId, effectivityDate);
          return {
            employeeId: dto.existingEmployeeId,
            companyId: current.companyId,
            leaveCredits,
            positionId: casualPositionId,
            previousJobOrderPositionId: current.positionId,
            portalAccount: 'unchanged',
          };
        }

        const [{ n: emailUsed }] = await manager.query(`SELECT COUNT(*) n FROM ${portal}users WHERE LOWER(email) = ?;`, [email]);
        if (Number(emailUsed) > 0) throw new HttpException('This email is already used by an Employee Portal account.', HttpStatus.CONFLICT);

        // Employee No.: +1 from the latest employee number of this year
        const year = today.getFullYear();
        const [latest] = await manager.query(
          `SELECT company_id companyId FROM employees WHERE company_id REGEXP ? ORDER BY CAST(SUBSTRING_INDEX(company_id, '-', -1) AS UNSIGNED) DESC LIMIT 1;`,
          [`^${year}-[0-9]+$`],
        );
        const companyId = nextCompanyId(year, latest?.companyId);

        const employeeId = randomUUID();
        const positionId = randomUUID();
        const userRole = isJobOrder ? UserRole.JOB_ORDER : UserRole.RANK_AND_FILE;

        // hris_prod
        await manager.query(
          `INSERT INTO employees (_id, company_id, first_name, middle_name, last_name, name_extension, title_prefix, title_suffix, user_role)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            employeeId,
            companyId,
            dto.firstName.trim(),
            (dto.middleName ?? '').trim(),
            dto.lastName.trim(),
            nullIfBlank(dto.nameExtension),
            nullIfBlank(dto.titlePrefix),
            nullIfBlank(dto.titleSuffix),
            userRole,
          ],
        );
        await manager.query(
          `INSERT INTO plantilla_positions (_id, position_title, nature_of_appointment, employee_id_fk, daily_rate, salary_grade_id_fk) VALUES (?, ?, ?, ?, ?, ?);`,
          [positionId, dto.positionTitle.trim(), dto.natureOfAppointment, employeeId, dailyRate, salaryGradeId],
        );
        await manager.query(`INSERT INTO ${orgTable[0]} (_id, position_id_fk, ${orgTable[1]}) VALUES (?, ?, ?);`, [randomUUID(), positionId, dto.orgId]);
        await manager.query(
          // Job Order: 'active' with the daily rate; Casual: 'approved nosa' with the salary grade
          isJobOrder
            ? `INSERT INTO nosi_nosa (_id, effectivity_date, status, employee_id_fk, position_id_fk, rate, is_per_piece) VALUES (?, ?, 'active', ?, ?, ?, ?);`
            : `INSERT INTO nosi_nosa (_id, effectivity_date, status, employee_id_fk, position_id_fk, actual_salary_grade_id_fk, adjusted_salary_grade_id_fk, is_per_piece)
               VALUES (?, ?, 'approved nosa', ?, ?, ?, ?, 0);`,
          isJobOrder
            ? [randomUUID(), effectivityDate, employeeId, positionId, dailyRate, dto.isPerPieceRate ? 1 : 0]
            : [randomUUID(), effectivityDate, employeeId, positionId, salaryGradeId, salaryGradeId],
        );

        // portal_prod
        const password = defaultPortalPassword(dto.firstName, companyId);
        await manager.query(`INSERT INTO ${portal}users (user_id, email, password) VALUES (?, ?, ?);`, [employeeId, email, await argon.hash(password)]);
        await manager.query(
          `INSERT INTO ${portal}employees (employee_id, company_id, first_name, middle_name, last_name, name_ext, sex, birth_date, mobile_number, email_address, photo_url, user_id_fk)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user.png', ?);`,
          [
            randomUUID(),
            companyId,
            dto.firstName.trim(),
            (dto.middleName ?? '').trim(),
            dto.lastName.trim(),
            nullIfBlank(dto.nameExtension),
            dto.sex,
            dto.birthday,
            String(dto.phoneNumber).trim(),
            email,
            employeeId,
          ],
        );

        const leaveCredits = isJobOrder ? [] : await this.addInitialCasualLeaveCredits(manager, employeeId, effectivityDate);

        return { employeeId, companyId, positionId, email, defaultPassword: password, leaveCredits };
      } finally {
        await manager.query(`SELECT RELEASE_LOCK('hrms:register-employee');`);
      }
    });
  }

  /** Active Job Order employees, for the "Casual from an existing Job Order employee" dropdown: { value, label } */
  async getJobOrderEmployeesForCasual() {
    return await this.entityRepository.query(`
      SELECT e._id value, CONCAT(get_employee_fullname2(e._id), ' (', IFNULL(e.company_id, ''), ') - ', pp.position_title) label
        FROM employees e
       INNER JOIN plantilla_positions pp ON pp.employee_id_fk = e._id AND pp.nature_of_appointment = 'job order'
       WHERE COALESCE((SELECT n.status FROM nosi_nosa n WHERE n.employee_id_fk = e._id AND n.effectivity_date <= CURDATE()
                        ORDER BY n.effectivity_date DESC, n.created_at DESC LIMIT 1), '') <> 'inactive'
       ORDER BY label;`);
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
      // const emailResult = await this.emailService.sendEmail(employeeDto.email, employee._id, salaryGrade, {
      //   companyId,
      //   firstName,
      //   middleName,
      //   lastName,
      //   nameExt: nameExtension,
      // });

      return {
        createdUser: employee,
        updatedPosition,
        //email: emailResult,
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

  async getAllActiveRegularEmployeeIds() {
    try {
      const employeeIds = await this.entityRepository.query(
        `SELECT 
        emp._id employeeId,
        get_employee_fullname2(emp._id), 
        emp.company_id companyId 
      FROM 
        employees emp 
      INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id 
      WHERE user_role IN 
      ('rank_and_file',
      'division_manager',
      'department_manager',
      'general_manager',
      'assistant_general_manager') 
      AND company_id IS NOT NULL AND company_id <> '' 
      AND (pp.item_number IS NULL OR pp.item_number NOT LIKE '%*%')
      AND is_active_employee(emp._id,now()) = 1;`,
      );

      return employeeIds;
    } catch (error) {
      throw new RpcException(error);
    }
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

  /**
   * Employees under a manager ({ value, label }), used by the portal training nomination dropdown
   * (GET employees/supervisors/:employee_id/subordinates) and LMS (get_employees_under_manager).
   * Separated employees (latest NOSI/NOSA 'inactive', effective on or before today) are left out.
   */
  async getSubordinates(employeeId: string) {
    const subordinates = (await this.entityRepository.query(`CALL sp_get_employees_under_manager(?);`, [employeeId]))[0] as { value: string; label: string }[];
    const separated = await this.getSeparatedEmployeeIds();
    return subordinates.filter((subordinate) => !separated.has(subordinate.value));
  }

  /** Employees whose latest NOSI/NOSA record is 'inactive' (retirement, resignation, death, ...) effective on or before today. */
  async getSeparatedEmployeeIds(): Promise<Set<string>> {
    const rows = (await this.entityRepository.query(`
      SELECT nn.employee_id_fk employeeId
        FROM nosi_nosa nn
       WHERE nn.status = 'inactive'
         AND nn.effectivity_date <= CURDATE()
         AND nn.effectivity_date = (SELECT MAX(nn2.effectivity_date) FROM nosi_nosa nn2 WHERE nn2.employee_id_fk = nn.employee_id_fk);
    `)) as { employeeId: string }[];
    return new Set(rows.map((row) => row.employeeId));
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

  /**
   * Report on Employee Information.
   *  - Only employees active on the active roll date (asOf, default today), based on NOSI/NOSA:
   *      * the latest record effective on or before the date is not 'inactive' (retired, resigned, deceased ...)
   *      * no record yet on the date: included only when the employee's first record is permanent / casual
   *        (records encoded late); a job order / contract of service whose first record is later was not yet hired
   *  - Nature of appointment filter ('' = all)
   *  - Salary grade / amount in effect on the date (NOSI/NOSA), else the plantilla position's
   *  - Age on the date; addresses without empty parts; columns kept only when selected (TIN was always removed)
   * Built with a few queries in HRIS (+ portal tables) instead of several microservice calls per employee.
   */
  async generateReportOnEmployeeDetails(employeeDetailsFilter: {
    companyId: boolean | string;
    employeeId: string;
    natureOfAppointment: NatureOfAppointment | string;
    personalDetails: boolean | string;
    gsis: boolean | string;
    pagibig: boolean | string;
    sss: boolean | string;
    tin: boolean | string;
    residentialAddress: boolean | string;
    permanentAddress: boolean | string;
    primaryEducation: boolean | string;
    secondaryEducation: boolean | string;
    vocationalCourse: boolean | string;
    collegeEducation: boolean | string;
    graduateStudies: boolean | string;
    eligibility: boolean | string;
    dateHired: boolean | string;
    philhealth: boolean | string;
    assignment: boolean | string;
    office: boolean | string;
    department: boolean | string;
    division: boolean | string;
    positionTitle: boolean | string;
    salaryGrade: boolean | string;
    amount: boolean | string;
    asOf?: string;
  }) {
    const portal = process.env.PORTAL_DB_NAME;
    const f = employeeDetailsFilter;
    const on = (v: boolean | string | undefined) => v !== undefined && v !== null && v.toString() === 'true';
    const asOf = f.asOf && /^\d{4}-\d{2}-\d{2}$/.test(f.asOf) ? f.asOf : new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10); // today in Asia/Manila
    const natureOfAppointment = f.natureOfAppointment && !['false', 'all', 'undefined'].includes(f.natureOfAppointment.toString()) ? f.natureOfAppointment.toString() : '';
    const employeeId = f.employeeId && f.employeeId !== 'undefined' ? f.employeeId : '';

    const rows = (await this.entityRepository.query(
      `
      SELECT * FROM (
        SELECT
          emp._id employeeId,
          get_employee_fullname2(emp._id) fullName,
          emp.company_id companyId,
          pp.position_title positionTitle,
          pp.nature_of_appointment natureOfAppointment,
          get_employee_assignment_id(emp._id) assignmentId,
          get_employee_assignment(emp._id) assignment,
          (SELECT IF(n.status = 'inactive', 'inactive', 'active') FROM nosi_nosa n
            WHERE n.employee_id_fk = emp._id AND n.effectivity_date <= ?
            ORDER BY n.effectivity_date DESC, n.created_at DESC LIMIT 1) statusOnDate,
          (SELECT p2.nature_of_appointment FROM nosi_nosa n LEFT JOIN plantilla_positions p2 ON p2._id = n.position_id_fk
            WHERE n.employee_id_fk = emp._id ORDER BY n.effectivity_date ASC, n.created_at ASC LIMIT 1) firstAppointment,
          (SELECT CONCAT(sg.salary_grade, ' - ', sg.step_increment) FROM nosi_nosa n INNER JOIN salary_grade sg ON sg._id = n.adjusted_salary_grade_id_fk
            WHERE n.employee_id_fk = emp._id AND n.effectivity_date <= ? AND n.status IN ('approved nosi', 'approved nosa')
            ORDER BY n.effectivity_date DESC, n.created_at DESC LIMIT 1) nosiSalaryGrade,
          NULLIF(get_nosi_nosa_salary_grade_amount(emp._id, ?), 0) nosiSalaryGradeAmount,
          NULLIF(get_nosi_nosa_daily_rate(emp._id, ?), 0) nosiDailyRate,
          CONCAT(psg.salary_grade, ' - ', psg.step_increment) plantillaSalaryGrade,
          psg.amount plantillaSalaryGradeAmount,
          pp.daily_rate plantillaDailyRate,
          pe.sex sex,
          DATE_FORMAT(pe.birth_date, '%M %d, %Y') birthDate,
          TIMESTAMPDIFF(YEAR, pe.birth_date, ?) age,
          u.email email,
          gi.gsis_number gsis, gi.pagibig_number pagibig, gi.sss_number sss, gi.philhealth_number philhealth, gi.tin_number tin,
          pi.height height, pi.weight weight, pi.blood_type bloodType, pi.birth_place birthPlace, pi.civil_status civilStatus,
          NULLIF(CONCAT_WS(', ', NULLIF(TRIM(CONCAT_WS(' ', NULLIF(pa.house_number, ''), NULLIF(pa.street, ''))), ''),
                 NULLIF(pa.subdivision, ''), NULLIF(pa.barangay, ''), NULLIF(pa.city, ''), NULLIF(pa.province, ''), NULLIF(pa.zip_code, '')), '') permanentAddress,
          NULLIF(CONCAT_WS(', ', NULLIF(TRIM(CONCAT_WS(' ', NULLIF(ra.house_number, ''), NULLIF(ra.street, ''))), ''),
                 NULLIF(ra.subdivision, ''), NULLIF(ra.barangay, ''), NULLIF(ra.city, ''), NULLIF(ra.province, ''), NULLIF(ra.zip_code, '')), '') residentialAddress,
          IF(ee.user_id_fk IS NULL, NULL, CONCAT(IF(ee.year_graduated IS NOT NULL, 'Graduated', 'Attended'), ' (',
             IF(ee.year_graduated IS NOT NULL, ee.year_graduated, CONCAT_WS('-', ee.from, ee.to)), ')')) primaryEducation,
          IF(es.user_id_fk IS NULL, NULL, CONCAT(IF(es.year_graduated IS NOT NULL, 'Graduated', 'Attended'), ' (',
             IF(es.year_graduated IS NOT NULL, es.year_graduated, CONCAT_WS('-', es.from, es.to)), ')')) secondaryEducation,
          ${portal}get_vocational(emp._id) vocationalCourse,
          ${portal}get_college(emp._id) collegeEducation,
          ${portal}get_graduate(emp._id) graduateStudies,
          ${portal}get_eligibility(emp._id) eligibility,
          ${portal}get_date_hired_from_pds(emp._id) dateHired
        FROM employees emp
          INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
          LEFT JOIN salary_grade psg ON psg._id = pp.salary_grade_id_fk
          LEFT JOIN ${portal}employees pe ON pe.user_id_fk = emp._id
          LEFT JOIN ${portal}users u ON u.user_id = emp._id
          LEFT JOIN ${portal}pds_basic_government_info gi ON gi.user_id_fk = emp._id
          LEFT JOIN ${portal}pds_basic_personal_info pi ON pi.user_id_fk = emp._id
          LEFT JOIN ${portal}pds_basic_permanent_address pa ON pa.user_id_fk = emp._id
          LEFT JOIN ${portal}pds_basic_residential_address ra ON ra.user_id_fk = emp._id
          LEFT JOIN ${portal}pds_education_elementary ee ON ee.user_id_fk = emp._id
          LEFT JOIN ${portal}pds_education_secondary es ON es.user_id_fk = emp._id
        WHERE pp.position_title <> 'Chairman'
          AND (? = '' OR pp.nature_of_appointment = ?)
          AND (? = '' OR emp._id = ?)
      ) employees
      WHERE (statusOnDate = 'active' OR (statusOnDate IS NULL AND (firstAppointment IS NULL OR firstAppointment IN ('permanent', 'casual'))))
      ORDER BY fullName ASC;`,
      [asOf, asOf, asOf, asOf, asOf, natureOfAppointment, natureOfAppointment, employeeId, employeeId],
    )) as Record<string, any>[];

    // office / department / division names of each assignment (one call per distinct assignment)
    const orgNames = new Map<string, { officeName: string | null; departmentName: string | null; divisionName: string | null }>();
    for (const assignmentId of [...new Set(rows.map((r) => r.assignmentId).filter(Boolean))]) {
      const result = await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [assignmentId]);
      orgNames.set(assignmentId, result?.[0]?.[0] ?? { officeName: null, departmentName: null, divisionName: null });
    }

    return rows.map((r) => {
      const org = orgNames.get(r.assignmentId) ?? { officeName: null, departmentName: null, divisionName: null };
      const isSalaryGradeBased = r.natureOfAppointment === 'permanent' || r.natureOfAppointment === 'casual';
      const row: Record<string, any> = {
        fullName: r.fullName,
        natureOfAppointment: r.natureOfAppointment,
        companyId: r.companyId,
        positionTitle: r.positionTitle,
        assignment: r.assignment,
        office: org.officeName,
        department: org.departmentName,
        division: org.divisionName,
        sex: r.sex,
        birthDate: r.birthDate,
        age: r.age,
        email: r.email,
        civilStatus: r.civilStatus,
        birthPlace: r.birthPlace,
        height: r.height,
        weight: r.weight,
        bloodType: r.bloodType,
        dateHired: r.dateHired,
        residentialAddress: r.residentialAddress,
        permanentAddress: r.permanentAddress,
        gsis: r.gsis,
        pagibig: r.pagibig,
        philhealth: r.philhealth,
        sss: r.sss,
        tin: r.tin,
        primaryEducation: r.primaryEducation,
        secondaryEducation: r.secondaryEducation,
        vocationalCourse: r.vocationalCourse,
        collegeEducation: r.collegeEducation,
        graduateStudies: r.graduateStudies,
        eligibility: r.eligibility,
        salaryGrade: isSalaryGradeBased ? r.nosiSalaryGrade ?? r.plantillaSalaryGrade : null,
        salaryGradeAmount: isSalaryGradeBased ? r.nosiSalaryGradeAmount ?? r.plantillaSalaryGradeAmount : r.nosiDailyRate ?? r.plantillaDailyRate,
      };
      const keep: Array<[boolean | string, string[]]> = [
        [f.companyId, ['companyId']],
        [f.positionTitle, ['positionTitle']],
        [f.assignment, ['assignment']],
        [f.office, ['office']],
        [f.department, ['department']],
        [f.division, ['division']],
        [f.dateHired, ['dateHired']],
        [f.residentialAddress, ['residentialAddress']],
        [f.permanentAddress, ['permanentAddress']],
        [f.gsis, ['gsis']],
        [f.pagibig, ['pagibig']],
        [f.philhealth, ['philhealth']],
        [f.sss, ['sss']],
        [f.tin, ['tin']],
        [f.primaryEducation, ['primaryEducation']],
        [f.secondaryEducation, ['secondaryEducation']],
        [f.vocationalCourse, ['vocationalCourse']],
        [f.collegeEducation, ['collegeEducation']],
        [f.graduateStudies, ['graduateStudies']],
        [f.eligibility, ['eligibility']],
        [f.salaryGrade, ['salaryGrade']],
        [f.amount, ['salaryGradeAmount']],
        [f.personalDetails, ['sex', 'birthDate', 'age', 'email', 'civilStatus', 'birthPlace', 'height', 'weight', 'bloodType']],
      ];
      for (const [selected, keys] of keep) if (!on(selected)) keys.forEach((key) => delete row[key]);
      return row;
    });
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
    WHERE pp.position_title = 'General Manager A' AND o.name = 'Office of the General Manager')
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
    console.log(hrdDetails);

    const tddManagerId = await this.getTddManager();
    const tddDetails = await this.getEmployeeDetailsWithSignatureByEmployeeId(tddManagerId);
    console.log(tddDetails);

    const gmId = await this.getGeneralManager();
    const gmDetails = await this.getEmployeeDetailsWithSignatureByEmployeeId(gmId);
    console.log(gmDetails);

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
      const { dailyRate, email, employeeId, firstName, lastName, middleName, nameExtension, phoneNumber, sex, birthday, titlePrefix, titleSuffix, civilStatus } =
        updateBasicEmployeeInfoDto;
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
        //Update Civil Status  in Portal
        if (civilStatus.toString() !== '')
          await transactionalEntityManager.query(`UPDATE ${process.env.PORTAL_DB_NAME}pds_basic_personal_info SET civil_status = ? WHERE user_id_fk = ?;`, [
            civilStatus,
            employeeId,
          ]);
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
  async getBasicEmployeeInfo(employeeId: string): Promise<BasicEmployeeInfo> | null {
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
            pbpi.civil_status civilStatus,
            pp.daily_rate dailyRate
        FROM employees h_emp 
          INNER JOIN ${process.env.PORTAL_DB_NAME}employees p_emp ON h_emp._id = p_emp.user_id_fk
          INNER JOIN plantilla_positions pp ON pp.employee_id_fk = h_emp._id
          LEFT JOIN ${process.env.PORTAL_DB_NAME}pds_basic_personal_info pbpi ON pbpi.user_id_fk = h_emp._id 
        WHERE h_emp._id = ?;`,
        [employeeId],
      );
      return employee.length > 0 ? employee[0] : null;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getAllEmployeesWithPagination(pagination: { page: number; limit: number; name: string }) {
    try {
      const { page, limit, name } = pagination;
      const _items = (await this.entityRepository.query(`CALL sp_get_all_employees_paginated(?,?,?);`, [page, limit, name]))[0];
      let totalItems = 0;
      let items = [];
      if (_items.length > 0) {
        items = await Promise.all(
          _items.map(async (item) => {
            const { totalCount, ...rest } = item;
            return rest;
          }),
        );
        totalItems = _items[0].totalCount;
      }
      if (page !== 0 && limit !== 0) {
        const meta = {
          totalItems,
          itemCount: _items.length,
          itemsPerPage: Number(limit),
          totalPages: totalItems / limit > 1 ? Math.ceil(totalItems / limit) : 1,
          currentPage: Number(page),
        };
        console.log({ items, meta });
        return { items, meta };
      }
      return items;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getSimpleEmployeeDetails(employeeId: string) {
    try {
      const employeeDetails = (
        await this.employeeRepository.query(
          `
        SELECT
            hris_emp._id employeeId,
            hris_emp.company_id companyId,
            ${process.env.HRMS_DB_NAME}get_employee_fullname2(hris_emp._id) name,
            ${process.env.HRMS_DB_NAME}get_employee_position_or_oic(hris_emp._id) positionTitle,
            ${process.env.HRMS_DB_NAME}get_employee_assignment_or_oic(hris_emp._id) assignment,
            port_emp.mobile_number mobileNumber,
            port_emp.photo_url photoUrl
        FROM ${process.env.HRMS_DB_NAME}employees hris_emp
        INNER JOIN ${process.env.PORTAL_DB_NAME}employees port_emp ON hris_emp._id=port_emp.user_id_fk
        WHERE ${process.env.HRMS_DB_NAME}get_employee_position_or_oic(hris_emp._id) IS NOT NULL AND 
        hris_emp._id = ? 
        `,
          [employeeId],
        )
      )[0];
      console.log(employeeDetails);
      return employeeDetails;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
