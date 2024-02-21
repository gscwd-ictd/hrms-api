import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmpty, lastValueFrom } from 'rxjs';
import { EmailService } from 'src/global/auth/services/email.service';
import { EmployeeDTO } from 'src/core/employees/data/dtos/employee.dto';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { UserRole } from '../users/utils/enums/role.enum';
import { OfficerInChargeViewService } from '../officer-in-charge/data/officer-in-charge-view/officer-in-charge-view.service';
import { CommitteeMembersService } from '../committee-members/committee-members.service';

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
      .select('get_employee_fullname(emp._id)', 'fullName')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('emp._id = :_id', { _id })
      .getRawOne();
    return empName;
  }

  async getEmployeeDetails(_id: string) {
    const empPosition = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('emp._id', 'userId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('pp.position_title', 'positionTitle')
      .addSelect('pp._id', 'positionId')
      .addSelect('get_employee_fullname2(emp._id)', 'fullName')
      .addSelect('get_employee_assignment_id(emp._id)', 'id')
      .addSelect('get_employee_assignment(emp._id)', 'name')
      .addSelect('get_user_role(emp._id)', 'userRole')
      .addSelect('is_hrm_psb(emp._id)', 'isHRMPSB')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('emp._id = :_id', { _id })
      .getRawOne();

    const { id, name, userId, companyId, positionId, positionTitle, fullName, isHRMPSB, userRole } = empPosition;
    const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, userId));
    const overtimeImmediateSupervisorId = await lastValueFrom(this.clientEms.send('get_overtime_immediate_supervisor', _id));
    const { officeName, divisionName, departmentName } = (await this.entityRepository.query(`CALL sp_get_office_department_division(?);`, [id]))[0][0];
    const employeeSchedule = await lastValueFrom(this.clientEms.send('get_employee_schedule', _id));

    return {
      userId,
      ...employeePortalDetails,
      companyId,
      fullName,
      isHRMPSB,
      scheduleBase: employeeSchedule.schedule.scheduleBase,
      overtimeImmediateSupervisorId,
      assignment: { id, name, officeName, divisionName, departmentName, positionId, positionTitle },
      userRole,
    };
  }

  async getEmployeesByOrgId(orgId: string) {
    const employees = (await this.entityRepository.query(`CALL sp_get_employees_under_org_id(?);`, [orgId]))[0];
    console.log(employees);
    return employees;
  }

  async testEmail() {
    return await this.emailService.sendEmail('johnhenryalfeche@gmail.com', '62fef63c-b26f-11ed-a79b-000c29f95a80', 1, null);
  }

  async getEmployeesUnderSupervisor(employeeId: string) {
    const orgId = (await this.entityRepository.query('SELECT get_employee_assignment_id(?) orgId;', [employeeId]))[0];
    return await this.getEmployeesByOrgId(employeeId);
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
      .addSelect('get_employee_fullname(emp._id)', 'employeeFullName')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('pp.employee_id_fk IS NOT NULL AND company_id IS NOT NULL AND emp._id=:employeeId', { employeeId })
      .getRawOne();

    const { id, employeeFullName, companyId, positionId, positionTitle } = empPosition;

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
    //console.log(employeePortalDetails);
    return {
      id: employeeId,
      companyId,
      fullName: employeeFullName,
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
      .addSelect('get_employee_fullname(emp._id)', 'employeeFullName')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('pp.employee_id_fk IS NOT NULL AND company_id IS NOT NULL')
      .getRawMany();

    const employees = await Promise.all(
      empPositions.map(async (empPosition) => {
        const { id, name, employeeId, employeeFullName, companyId, positionId, positionTitle } = empPosition;

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
          avatar: employeePortalDetails.photoUrl,
          email: employeePortalDetails.emailAddress,
          division: divisionName,
          department: departmentName,
          office: officeName,
          positionTitle,
        };
      }),
    );
    console.log(employees);
    return employees;
  }

  async getEmployeeDetailsByEmployeeId(employeeId: string) {
    const empPosition = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('emp._id', 'userId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('get_employee_position_or_oic(emp._id)', 'positionTitle')
      .addSelect('get_employee_position_id_or_oic(emp._id)', 'positionId')
      .addSelect('get_position_assignment_id(get_employee_position_id_or_oic(emp._id))', 'id')
      .addSelect('get_position_assignment(get_employee_position_id_or_oic(emp._id))', 'name')
      .addSelect('is_hrm_psb(emp._id)', 'isHRMPSB')
      .addSelect('get_employee_fullname(emp._id)', 'employeeFullName')
      .addSelect('get_user_role(emp._id)', 'userRole')
      .innerJoin('plantilla_positions', 'pp', 'pp.employee_id_fk = emp._id')
      .where('emp._id = :employeeId', { employeeId })
      .getRawOne();

    const isPdcChairman = await this.committeeMembersService.isPdcChairman(employeeId);
    const isPdcSecretariat = await this.committeeMembersService.isPdcSecretariat(employeeId);
    const { id, name, userId, employeeFullName, companyId, positionId, positionTitle, isHRMPSB, userRole } = empPosition;
    const salaryGradeDetails = await this.getMonthHourlyRateByEmployeeId(employeeId);
    console.log(salaryGradeDetails);
    const salaryGradeAmount = salaryGradeDetails.monthlyRate;
    const salaryGrade = salaryGradeDetails.salaryGrade;
    //console.log(salaryGradeAmount);

    const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, userId));
    //const overtimeImmediateSupervisorId = await lastValueFrom(this.clientEms.send('get_overtime_immediate_supervisor', userId));
    console.log(employeePortalDetails);
    console.log({
      userId,
      companyId,
      employeeFullName,
      photoUrl: employeePortalDetails.photoUrl,
      salaryGradeAmount,
      salaryGrade,
      //overtimeImmediateSupervisorId,
      isHRMPSB,
      assignment: { id, name, positionId, positionTitle },
      userRole,
    });
    return {
      userId,
      companyId,
      isPdcChairman,
      isPdcSecretariat,
      employeeFullName,
      photoUrl: employeePortalDetails.photoUrl,
      salaryGradeAmount,
      salaryGrade,
      //overtimeImmediateSupervisorId,
      isHRMPSB,
      assignment: { id, name, positionId, positionTitle },
      userRole,
    };
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
        //.addSelect('emp.photo_url')
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
    } catch (error) {
      console.log(error);
      //throw new RpcException(error);
    }
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

    const { id, name, userId, companyId, positionId, positionTitle, userRole, salary } = empPosition;
    return {
      userId,
      companyId,
      photoUrl: employeePortalDetails.photoUrl,
      assignment: { id, name, positionId, positionTitle, salary },
      userRole,
    };
  }

  async getEmployeeNameByIdForEmpMonitoring(ids: { employeeId: string; supervisorId: string }) {
    try {
      const { employeeId, supervisorId } = ids;
      const employeeSignature = await this.getEmployeeSignature(employeeId);
      console.log('emp signature: ', employeeSignature);

      const supervisorSignature = await this.getEmployeeSignature(supervisorId);
      console.log('supervisor signature: ', supervisorSignature);

      const employeeName = (await this.getEmployeeNameById(employeeId)).fullName;
      console.log(employeeName);

      const supervisorName = (await this.getEmployeeNameById(supervisorId)).fullName;
      console.log(supervisorName);

      return { employeeName, employeeSignature, supervisorName, supervisorSignature };
    } catch (error) {
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

  async getEmployeePhotoUrl(employeeId: string) {
    try {
      const employeePortalDetails = await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_portal_details' }, employeeId));
      const { photoUrl } = employeePortalDetails;
      return photoUrl;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getAllEmployees() {
    const empPositions = await this.employeeRepository
      .createQueryBuilder('emp')
      .select('emp._id', 'employeeId')
      .addSelect('emp.company_id', 'companyId')
      .addSelect('get_employee_fullname(emp._id)', 'fullName')
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
      .getRawMany();

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

  async getAllPermanentCasualEmployees() {
    return await this.entityRepository.query(
      `SELECT get_employee_fullname(emp._id) label,emp._id value FROM employees emp INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id WHERE pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent' ORDER BY get_employee_fullname(emp._id) ASC;`,
    );
  }

  async getAllPermanentCasualEmployees2() {
    return await this.entityRepository.query(
      `SELECT get_employee_fullname2(emp._id) label,emp._id value FROM employees emp INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id WHERE pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent' ORDER BY get_employee_fullname2(emp._id) ASC;`,
    );
  }

  async getAllAssignablePermanentCasualEmployees(employeeIds: string[]) {
    if (employeeIds.length > 0)
      return await this.entityRepository.query(
        `SELECT get_employee_fullname2(emp._id) label,emp._id value FROM employees emp INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id WHERE pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent' AND emp._id NOT IN (?) ORDER BY get_employee_fullname2(emp._id) ASC;`,
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
      console.log(error);
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
      console.log(position);
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

  async getAllEmployeeNames() {
    return await this.entityRepository.query(`SELECT _id employeeId, get_employee_fullname(_id) fullName, get_employee_position_or_oic(_id) positionTitle FROM employees;`);
  }

  async getEmployeesByNameMatch(name: string) {
    return await this.entityRepository.query(
      `SELECT _id employeeId, get_employee_fullname(_id) fullName,get_employee_position_or_oic(_id) positionTitle  FROM employees WHERE get_employee_fullname(_id) LIKE CONCAT('%',?,'%') ORDER BY get_employee_fullname(_id) ASC;`,
      [name],
    );
  }

  async getAllRegularEmployeeIds() {
    try {
      const employeeIds = await this.entityRepository.query(
        `SELECT emp._id employeeId,emp.company_id companyId FROM employees emp INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id WHERE user_role IN ('rank_and_file','division_manager','department_manager','general_manager','assistant_general_manager') AND company_id IS NOT NULL AND company_id <> '';`,
      );
      console.log(employeeIds);
      return employeeIds;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getMonthHourlyRateByEmployeeId(employeeId: string) {
    try {
      const monthlyRate = await this.entityRepository.query(
        `
        SELECT amount, concat(sg.salary_grade,'-',sg.step_increment) salaryGrade
        FROM salary_grade sg 
          INNER JOIN plantilla_positions pp ON pp.salary_grade_id_fk = sg._id
          INNER JOIN employees e ON e._id = pp.employee_id_fk WHERE e._id = ?;`,
        [employeeId],
      );
      console.log('salary z: ', monthlyRate[0]);
      if (typeof monthlyRate[0] !== 'undefined') {
        const hourlyRate = parseFloat((monthlyRate[0].amount / 22 / 8).toFixed(2));
        return { monthlyRate: monthlyRate[0].amount, hourlyRate, salaryGrade: monthlyRate[0].salaryGrade };
      } else return { monthlyRate: null, hourlyRate: null, salaryGrade: null };
    } catch (error) {
      return { monthlyRate: null, hourlyRate: null, salaryGrade: null };
    }
  }

  async getEmployeeNatureOfAppointment(employeeId: string) {
    try {
      console.log('asd asd asd');
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

  async isGeneralManager(employeeId: string) {
    try {
      const { isGeneralManager } = (await this.entityRepository.query(`SELECT is_general_manager(?) isGeneralManager;`, [employeeId]))[0];
      console.log(isGeneralManager);
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
}
