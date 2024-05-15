import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { EmployeeDTO } from 'src/core/employees/data/dtos/employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('/name/')
  async getEmployeesByNameMatch(@Query('value') name: string) {
    if (name === undefined) return await this.employeesService.getAllEmployeeNames();
    return await this.employeesService.getEmployeesByNameMatch(name);
  }

  @Get('')
  async getAllEmployeesList() {
    return await this.employeesService.getAllEmployees();
  }

  @Get('/sub')
  async getEmployeesUnderSupervisor(employeeId: string) {
    return await this.employeesService.getEmployeesUnderSupervisor(employeeId);
  }

  @MessagePattern('get_employee_under_supervisor')
  async getEmployeesUnderSupervisorMS(employeeId: string) {
    return await this.employeesService.getEmployeesUnderSupervisor(employeeId);
  }

  @MessagePattern('get_employees_by_name_match')
  async getEmployeesByNameMatchMS(@Payload() name: string) {
    if (name === null || name === undefined) return await this.employeesService.getAllEmployeeNames();
    return await this.employeesService.getEmployeesByNameMatch(name);
  }

  @MessagePattern({ msg: 'find_all_employees' })
  async getAllEmployees() {
    return await this.employeesService.findEntityAll();
  }

  @MessagePattern('find_employee_by_id_lnd')
  async getEmployeeByIdForLND(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeByIdForLND(employeeId);
    } catch (error) {
      console.log(error);
      throw new RpcException(error);
    }
  }

  @MessagePattern('find_all_employees_lnd')
  async getAllEmployeesForLND() {
    try {
      return await this.employeesService.getEmployeesForLND();
    } catch (error) {
      console.log(error);
      throw new RpcException(error);
    }
  }

  @MessagePattern('find_all_employees_test')
  async getAllEmployeesTest() {
    return await this.employeesService.findEntityAll();
  }

  @MessagePattern('get_employees_by_org_id')
  async getEmployeesByOrgId(@Payload() orgId: string) {
    return await this.employeesService.getEmployeesByOrgId(orgId);
  }

  @MessagePattern('get_employees_by_org_id_alone')
  async getEmployeesByOrgIdAloneMS(orgId: string) {
    return await this.employeesService.getEmployeesByOrgIdAlone(orgId);
  }

  @Get('/:organization_id/list/')
  async getEmployeesByOrgIdAlone(@Param('organization_id') orgId: string) {
    return await this.employeesService.getEmployeesByOrgIdAlone(orgId);
  }

  @MessagePattern({ msg: 'find_employee' })
  async getEmployeeById(@Payload() _id: string) {
    try {
      return await this.employeesService.getEmployeeDetails(_id);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_employee_details')
  async getEmployeeDetailsByEmployeeId(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeDetailsByEmployeeId(employeeId);
    } catch (error) {
      console.log(error);
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('find_employee_ems')
  async getEmployeeByIdEms(@Payload() _id: string) {
    try {
      return await this.employeesService.getEmployeeDetailsEMS(_id);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern({ msg: 'get_employee_name' })
  async getEmployeeNameById(_id: string) {
    try {
      console.log(_id);
      return await this.employeesService.getEmployeeNameById(_id);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern({ msg: 'get_employee_signature' })
  async getEmployeeSignature(_id: string) {
    try {
      return await this.employeesService.getEmployeeSignature(_id);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_employee_name')
  async getEmployeeNameByIdEmpMonitoring(@Payload() _id: string) {
    try {
      console.log(_id);
      return await this.employeesService.getEmployeeNameById(_id);
    } catch (error) {
      console.log('asd');
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_employee_supervisor_names')
  async getEmployeeNameByIdForEmpMonitoring(ids: { employeeId: string; supervisorId: string }) {
    return await this.employeesService.getEmployeeNameByIdForEmpMonitoring(ids);
  }

  @MessagePattern('create_employee')
  async addEmployee(employeeDto: EmployeeDTO) {
    return await this.employeesService.saveEntity(employeeDto);
  }

  @MessagePattern('update_employee')
  async updateEmployee(employeeDto: EmployeeDTO) {
    return await this.employeesService.updateEntity(employeeDto);
  }

  @MessagePattern('delete_employee')
  async removeEmployee(_id: string) {
    return await this.employeesService.removeEntity(_id);
  }

  @Post()
  async addEmployeeWithRegisterLink(@Body() addEmployeeObj: EmployeeDTO) {
    return await this.employeesService.addEmployeeWithRegisterLink(addEmployeeObj);
  }

  @Get()
  async getEmployeesWithPositions() {
    return await this.employeesService.getAllEmployees();
  }

  @Get('/options/')
  async getAllPermanentCasualEmployees() {
    return await this.employeesService.getAllPermanentCasualEmployees();
  }

  @Get('/options/v2/')
  async getAllPermanentCasualEmployees2() {
    return await this.employeesService.getAllPermanentCasualEmployees2();
  }

  @MessagePattern('get_all_assignable_permanent_casual_employees')
  async getAllAssignablePermanentCasualEmployees(@Payload() employeeIds: string[]) {
    return await this.employeesService.getAllAssignablePermanentCasualEmployees(employeeIds);
  }

  @MessagePattern('get_all_permanent_casual_employees')
  async getAllPermanentCasualEmployeesMS() {
    return await this.employeesService.getAllPermanentCasualEmployees();
  }

  @MessagePattern('get_all_assignable_supervisory_employees')
  async getAllAssignableSupervisoryEmployees() {
    return await this.employeesService.getAllAssignableSupervisoryEmployees();
  }

  @MessagePattern('get_all_assignable_supervisory_employees_by_id')
  async getAllAssignableSupervisoryEmployeesByEmployeeId(@Payload() employeeId: string) {
    return await this.employeesService.getAllAssignableSupervisorEmployeesByEmployeeId(employeeId);
  }

  @MessagePattern('get_all_permanent_casual_employees2')
  async getAllPermanentCasualEmployees2MS() {
    return await this.employeesService.getAllPermanentCasualEmployees2();
  }

  @MessagePattern('get_employee_supervisor_id')
  async getEmployeeSupervisorMs(@Payload() employeeId: string) {
    return await this.employeesService.getEmployeeSupervisor(employeeId);
  }

  @MessagePattern('get_all_employees_with_supervisor')
  async getAllEmployeesWithSupervisorMs() {
    return await this.employeesService.getAllEmployeesWithSupervisor();
  }

  @MessagePattern('get_employee_with_supervisor')
  async getEmployeeWithSupervisorMs(@Payload() employeeId: string) {
    return await this.employeesService.getEmployeeWithSupervisor(employeeId);
  }

  @Get('asd/asd/asd/asd/asd/:employee_id')
  async getEmployeeWithSupervisor(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getEmployeeWithSupervisor(employeeId);
  }

  @Get('asd/asd/asd/asd')
  async getAllEmployeesWithSupervisor() {
    return await this.employeesService.getAllEmployeesWithSupervisor();
  }

  @Get('/:employee_id/company-id')
  async getCompanyIdByEmployeeId(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getCompanyIdByEmployeeId(employeeId);
  }

  @MessagePattern('get_company_id_by_employee_id')
  async getCompanyIdByEmployeeIdMs(@Payload() employeeId: string) {
    return await this.employeesService.getCompanyIdByEmployeeId(employeeId);
  }

  @Get(':id')
  async getAnEmployeeById(@Param('id') _id: string) {
    try {
      //console.log(await this.employeesService.getEmployeeDetailsByEmployeeId(_id));
      return await this.employeesService.getEmployeeDetails(_id);
    } catch (error) {
      console.log(error);
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('employee-portal/details/:id')
  async getEmployeePortalDetails(@Param('id') _id: string) {
    return await this.employeesService.getEmployeePortalDetails(_id);
  }

  @MessagePattern('get_employees_for_population')
  async getEmployeeWithCredentials() {
    try {
      return await this.employeesService.entityRepository.query(`
      SELECT employees._id employeeId,company_id companyId,first_name firstName,middle_name middleName,last_name lastName,name_extension nameExt, get_employee_position(employees._id) positionTitle,
      REPLACE(CONCAT(REPLACE(REPLACE(LOWER(REPLACE(first_name,' ','')),'\\'',''),'.',''),REPLACE(LOWER(REPLACE(last_name,' ','')),'\\'',''),REPLACE(LOWER(name_extension),'.',''),'@gscwd.com'),'-','') email, CONCAT('@',REPLACE(REPLACE(LOWER(REPLACE(first_name,' ','')),'\\'',''),'.',''),REPLACE(company_id,'-','')) \`password\`
      FROM employees INNER JOIN plantilla_positions pp ON pp.employee_id_fk = employees._id WHERE DATE_FORMAT(employees.created_at,'%Y-%m-%d') =  DATE_FORMAT(now(),'%Y-%m-%d')  AND employees.company_id IS NOT NULL ORDER BY last_name ASC;
          `);
    } catch (error) {
      console.log(error);
    }
  }

  @MessagePattern('get_employee_details_by_company_id')
  async getEmployeeDetailsByCompanyIdMS(@Payload() companyId: string) {
    return await this.employeesService.getEmployeeDetailByCompanyIdMS(companyId);
  }

  @MessagePattern('get_custom_group_assigned_member')
  async getCustomGroupAssignedMember(@Payload() employeeIds: string[]) {
    return await this.employeesService.getCustomGroupsAssignedMember(employeeIds);
  }

  @MessagePattern('get_custom_group_unassigned_rank_file_member')
  async getCustomGroupUnassignedRankFileMember(@Payload() employeeIds: string[]) {
    return await this.employeesService.getCustomGroupsUnassignedRankFileMember(employeeIds);
  }

  @MessagePattern('get_custom_group_unassigned_job_order_cos_member')
  async getCustomGroupUnassignedJobOrderCOSMember(@Payload() employeeIds: string[]) {
    return await this.employeesService.getCustomGroupsUnassignedJobOrderCOSMember(employeeIds);
  }

  @MessagePattern('get_all_managers')
  async getAllManagers() {
    return await this.employeesService.getAllManagers();
  }

  @Get('company-id/:company_id')
  async getEmployeeDetailsByCompanyId(@Param('company_id') companyId: string) {
    return await this.employeesService.getEmployeeDetailByCompanyId(companyId);
  }

  @MessagePattern('get_all_regular_employee_ids')
  async getAllRegularEmployeeIds() {
    return await this.employeesService.getAllRegularEmployeeIds();
  }

  @Get(':id/test/test')
  async getEmployeeDetails(@Param('id') _id: string) {
    return await this.employeesService.getEmployeeDetails(_id);
  }

  @MessagePattern('get_monthly_hourly_rate_by_employee_id')
  async getMonthHourlyRateByEmployeeId(@Payload() employeeId: string) {
    return await this.employeesService.getMonthHourlyRateByEmployeeId(employeeId);
  }

  @MessagePattern('get_employee_nature_of_appointment')
  async getEmployeeNatureOfAppointment(@Payload() employeeId: string) {
    return await this.employeesService.getEmployeeNatureOfAppointment(employeeId);
  }

  @Get('supervisors/:employee_id/subordinates')
  async getSubordinates(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getSubordinates(employeeId);
  }

  @MessagePattern('get_subordinates_with_company_id')
  async getSubordinatesWithCompanyId(@Payload() employeeId: string) {
    return await this.employeesService.getSubordinatesWithCompanyId(employeeId);
  }

  @MessagePattern('is_general_manager_or_oic')
  async isGeneralManager(@Payload() employeeId: string) {
    return await this.employeesService.isGeneralManager(employeeId);
  }

  @MessagePattern('get_company_ids_by_org_id')
  async getCompanyIdsByOrgId(@Payload() orgId: string) {
    return await this.employeesService.getCompanyIdsByOrgId(orgId);
  }

  /* find employee details by plantilla id */
  @Get('plantilla/:plantillaId')
  async getEmployeeDetailsByPlantillaId(@Param('plantillaId') plantillaId: string) {
    return await this.employeesService.getEmployeeDetailsByPlantillaId(plantillaId);
  }
}
