import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
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

  @MessagePattern('get_employees_by_name_match')
  async getEmployeesByNameMatchMS(@Payload() name: string) {
    if (name === null || name === undefined) return await this.employeesService.getAllEmployeeNames();
    return await this.employeesService.getEmployeesByNameMatch(name);
  }

  @MessagePattern({ msg: 'find_all_employees' })
  async getAllEmployees() {
    return await this.employeesService.findEntityAll();
  }

  @MessagePattern('find_all_employees_test')
  async getAllEmployeesTest() {
    return await this.employeesService.findEntityAll();
  }

  @MessagePattern({ msg: 'find_employee' })
  async getEmployeeById(@Payload() _id: string) {
    try {
      return await this.employeesService.getEmployeeDetails(_id);
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

  @MessagePattern('get_employee_supervisor_id')
  async getEmployeeSupervisor(@Payload() employeeId: string) {
    return await this.employeesService.getEmployeeSupervisor(employeeId);
  }

  @Get('/:employee_id/company-id')
  async getCompanyIdByEmployeeId(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getCompanyIdByEmployeeId(employeeId);
  }

  @Get(':id')
  async getAnEmployeeById(@Param('id') _id: string) {
    try {
      return await this.employeesService.getEmployeeDetails(_id);
    } catch {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
  }

  // @MessagePattern('get_employees_for_population')
  // async getEmployeeWithCredentials() {
  //   try {
  //     return await this.employeesService.entityRepository.query(`
  //     SELECT employees._id employeeId,company_id companyId,first_name firstName,middle_name middleName,last_name lastName,name_extension nameExt, get_employee_position(employees._id) positionTitle,
  //     REPLACE(CONCAT(REPLACE(REPLACE(LOWER(REPLACE(first_name,' ','')),'\\'',''),'.',''),REPLACE(LOWER(REPLACE(last_name,' ','')),'\\'',''),REPLACE(LOWER(name_extension),'.',''),'@gscwd.com'),'-','') email, CONCAT('@',REPLACE(REPLACE(LOWER(REPLACE(first_name,' ','')),'\\'',''),'.',''),REPLACE(company_id,'-','')) \`password\`
  //     FROM employees INNER JOIN plantilla_positions pp ON pp.employee_id_fk = employees._id  WHERE employees.company_id IN ('2014-003','2017-002','2017-049') AND employees.company_id IS NOT NULL ORDER BY last_name ASC;
  //         `);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  @MessagePattern('get_employee_details_by_company_id')
  async getEmployeeDetailsByCompanyIdMS(@Payload() companyId: string) {
    return await this.employeesService.getEmployeeDetailByCompanyId(companyId);
  }

  @MessagePattern('get_custom_group_assigned_member')
  async getCustomGroupAssignedMember(@Payload() employeeIds: string[]) {
    return await this.employeesService.getCustomGroupsAssignedMember(employeeIds);
  }

  @MessagePattern('get_custom_group_unassigned_member')
  async getCustomGroupUnassignedMember(@Payload() employeeIds: string[]) {
    return await this.employeesService.getCustomGroupsUnassignedMember(employeeIds);
  }

  @MessagePattern('get_all_managers')
  async getAllManagers() {
    return await this.employeesService.getAllManagers();
  }

  @Get('company-id/:company_id')
  async getEmployeeDetailsByCompanyId(@Param('company_id') companyId: string) {
    return await this.employeesService.getEmployeeDetailByCompanyId(companyId);
  }

  @MessagePattern('get_supervisor_of_employees_with_tags')
  async getSupervisorEmployees(@Payload() data: { tags: any[] }) {
    return await this.employeesService.getSupervisorEmployees(data);
  }

  @Get(':id/test/test')
  async getEmployeeDetails(@Param('id') _id: string) {
    return await this.employeesService.getEmployeeDetails(_id);
  }
}
