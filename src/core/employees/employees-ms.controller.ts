import { Controller, UseFilters } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { EmployeeDTO } from './data/dtos/employee.dto';
import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';
import { MsExceptionFilter } from 'src/global/utils/filters/rpc-exception.filter';

@UseFilters(new MsExceptionFilter())
@Controller('')
export class EmployeesMsController {
  constructor(private readonly employeesService: EmployeesService) {}

  @MessagePattern('get_employee_under_supervisor')
  async getEmployeesUnderSupervisorMS(employeeId: string) {
    try {
      return await this.employeesService.getEmployeesUnderSupervisor(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employees_by_name_match')
  async getEmployeesByNameMatchMS(@Payload() name: string) {
    try {
      if (name === null || name === undefined) return await this.employeesService.getAllEmployeeNames();
      return await this.employeesService.getEmployeesByNameMatch(name);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ msg: 'find_all_employees' })
  async getAllEmployees() {
    try {
      const result = await this.employeesService.findEntityAll();
      console.log(result);
      return result;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_inactive_employees')
  async getAllInactiveEmployees() {
    try {
      return await this.employeesService.getAllInactiveEmployees();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('find_employee_by_id_lnd')
  async getEmployeeByIdForLND(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeByIdForLND(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('find_all_employees_lnd')
  async getAllEmployeesForLND() {
    try {
      return await this.employeesService.getEmployeesForLND();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('find_all_employees_test')
  async getAllEmployeesTest() {
    try {
      return await this.employeesService.findEntityAll();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employees_by_org_id')
  async getEmployeesByOrgId(@Payload() orgId: string) {
    try {
      return await this.employeesService.getEmployeesByOrgId(orgId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // @MessagePattern('get_employees_by_org_id_for_ot')
  // async getEmployeesByOrgIdForOt(@Payload() orgId: string) {
  //   return await this.employeesService.getEmployeesByOrgIdForOt(orgId);
  // }

  @MessagePattern('get_employees_with_managers_by_org_id')
  async getEmployeesByOrgIdWithManagers(@Payload() orgId: string) {
    try {
      return await this.employeesService.getEmployeesByOrgIdWithManagers(orgId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employees_by_org_id_alone')
  async getEmployeesByOrgIdAloneMS(orgId: string) {
    try {
      return await this.employeesService.getEmployeesByOrgIdAlone(orgId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern({ msg: 'find_employee' })
  async getEmployeeById(@Payload() _id: string) {
    try {
      return await this.employeesService.getEmployeeDetails(_id);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_basic_employee_details')
  async getBasicEmployeeDetails(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getBasicEmployeeDetailsByEmployeeId(employeeId);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_basic_employee_details_with_signature')
  async getBasicEmployeeDetailsWithSignature(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getBasicEmployeeDetailsByEmployeeIdWithSignature(employeeId);
    } catch (error) {
      console.log(error);
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_employee_details')
  async getEmployeeDetailsByEmployeeId(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeDetailsByEmployeeId(employeeId);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_employee_details_with_signature')
  async getEmployeeDetailsWithSignatureByEmployeeId(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeDetailsWithSignatureByEmployeeId(employeeId);
    } catch (error) {
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
      return await this.employeesService.getEmployeeNameById(_id);
    } catch (error) {
      throw new RpcException('Employee not found');
    }
  }

  @MessagePattern('get_employee_supervisor_names')
  async getEmployeeNameByIdForEmpMonitoring(ids: { employeeId: string; supervisorId: string }) {
    try {
      return await this.employeesService.getEmployeeNameByIdForEmpMonitoring(ids);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('create_employee')
  async addEmployee(employeeDto: EmployeeDTO) {
    try {
      return await this.employeesService.saveEntity(employeeDto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('update_employee')
  async updateEmployee(employeeDto: EmployeeDTO) {
    try {
      return await this.employeesService.updateEntity(employeeDto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('delete_employee')
  async removeEmployee(_id: string) {
    try {
      return await this.employeesService.removeEntity(_id);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_assignable_permanent_casual_employees')
  async getAllAssignablePermanentCasualEmployees(@Payload() employeeIds: string[]) {
    try {
      return await this.employeesService.getAllAssignablePermanentCasualEmployees(employeeIds);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_permanent_casual_employees')
  async getAllPermanentCasualEmployeesMS() {
    try {
      return await this.employeesService.getAllPermanentCasualEmployees();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_assignable_supervisory_employees')
  async getAllAssignableSupervisoryEmployees() {
    try {
      return await this.employeesService.getAllAssignableSupervisoryEmployees();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_assignable_supervisory_employees_by_id')
  async getAllAssignableSupervisoryEmployeesByEmployeeId(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getAllAssignableSupervisorEmployeesByEmployeeId(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_permanent_casual_employees2')
  async getAllPermanentCasualEmployees2MS() {
    try {
      return await this.employeesService.getAllPermanentCasualEmployees2();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employee_supervisor_id')
  async getEmployeeSupervisorMs(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeSupervisor(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_employees_with_supervisor')
  async getAllCasualPermanentEmployeesWithSupervisorMs() {
    try {
      return await this.employeesService.getAllPermanentCasualEmployeesWithSupervisor();
    } catch (error) {
      console.log(error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_permanent_casual_jo_employees_with_supervisor')
  async getAllEmployeesWithSupervisorMs() {
    try {
      return await this.employeesService.getAllEmployeesWithSupervisor();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employee_with_supervisor')
  async getEmployeeWithSupervisorMs(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeWithSupervisor(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_company_id_by_employee_id')
  async getCompanyIdByEmployeeIdMs(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getCompanyIdByEmployeeId(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
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
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_salary_grade_or_daily_rate_by_employee_id')
  async getSalaryGradeIdOrDailyRateByEmployeeId(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getSalaryGradeIdOrDailyRateByEmployeeId(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employee_details_by_company_id')
  async getEmployeeDetailsByCompanyIdMS(@Payload() companyId: string) {
    try {
      return await this.employeesService.getEmployeeDetailByCompanyIdMS(companyId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_custom_group_assigned_member')
  async getCustomGroupAssignedMember(@Payload() employeeIds: string[]) {
    try {
      return await this.employeesService.getCustomGroupsAssignedMember(employeeIds);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_custom_group_unassigned_rank_file_member')
  async getCustomGroupUnassignedRankFileMember(@Payload() employeeIds: string[]) {
    try {
      return await this.employeesService.getCustomGroupsUnassignedRankFileMember(employeeIds);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_custom_group_unassigned_job_order_cos_member')
  async getCustomGroupUnassignedJobOrderCOSMember(@Payload() employeeIds: string[]) {
    try {
      return await this.employeesService.getCustomGroupsUnassignedJobOrderCOSMember(employeeIds);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_managers')
  async getAllManagers() {
    try {
      return await this.employeesService.getAllManagers();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_managers_for_lnd')
  async getAllManagersForLnd() {
    try {
      return await this.employeesService.getAllManagersForLnd();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employees_under_manager')
  async getEmployeesUnderManager(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getSubordinates(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_monthly_hourly_rate_by_employee_id')
  async getMonthHourlyRateByEmployeeId(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getMonthHourlyRateByEmployeeId(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employee_nature_of_appointment')
  async getEmployeeNatureOfAppointment(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeeNatureOfAppointment(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_subordinates_with_company_id')
  async getSubordinatesWithCompanyId(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getSubordinatesWithCompanyId(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('is_general_manager_or_oic')
  async isGeneralManager(@Payload() employeeId: string) {
    try {
      return await this.employeesService.isGeneralManager(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_company_ids_by_org_id')
  async getCompanyIdsByOrgId(@Payload() orgId: string) {
    try {
      return await this.employeesService.getCompanyIdsByOrgId(orgId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_active_regular_employee_ids')
  async getAllActiveRegularEmployeeIds() {
    try {
      return await this.employeesService.getAllActiveRegularEmployeeIds();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_regular_employee_ids')
  async getAllRegularEmployeeIds() {
    try {
      return await this.employeesService.getAllRegularEmployeeIds();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employee_position_by_id')
  async getEmployeePosition(@Payload() employeeId: string) {
    try {
      return await this.employeesService.getEmployeePosition(employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employees_by_nature_of_appointment_employee_id')
  async getAllEmployeesByNatureOfAppointmentAndEmployeeId(@Payload() employeeDetailsFilter: { natureOfAppointment: NatureOfAppointment; employeeId: string }) {
    try {
      return await this.employeesService.getEmployeesByNatureOfAppointmentAndEmployeeId(employeeDetailsFilter.natureOfAppointment, employeeDetailsFilter.employeeId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_hrd_manager')
  async getHrdManager() {
    try {
      return await this.employeesService.getHrdManager();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_training_signatories')
  async getTrainingSignatories(@Payload() includeGm: boolean) {
    try {
      return await this.employeesService.getSignatoriesForTrainingCertification(includeGm);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employees_by_nature_of_appointment')
  async getEmployeesByNatureOfAppointment(@Payload() natureOfAppointment: NatureOfAppointment) {
    try {
      return await this.employeesService.getEmployeesByNatureOfAppointment(natureOfAppointment);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_employees_by_nature_of_appointment_and_employee_ids')
  async getEmployeesByNatureOfAppointmentAndEmployeeIds(@Payload() data: { natureOfAppointment: NatureOfAppointment; employeeIds: string[] }) {
    try {
      return await this.employeesService.getEmployeesByNatureOfAppointmentAndEmployeeIdRange(data.natureOfAppointment, data.employeeIds);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_employees_paginated')
  async getAllEmployeesWithPagination(@Payload() pagination: { page: number; limit: number; name: string }) {
    return await this.employeesService.getAllEmployeesWithPagination(pagination);
  }

  @MessagePattern('get_simple_employee_details')
  async getSimpleEmployeeDetails(@Payload() employeeId: string) {
    return await this.employeesService.getSimpleEmployeeDetails(employeeId);
  }
}
