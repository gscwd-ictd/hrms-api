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

  @Get('test/test/test/test')
  async testEmail() {
    return await this.employeesService.testEmail();
  }

  @Get('/sub')
  async getEmployeesUnderSupervisor(employeeId: string) {
    return await this.employeesService.getEmployeesUnderSupervisor(employeeId);
  }

  @Get('/:organization_id/list/')
  async getEmployeesByOrgIdAlone(@Param('organization_id') orgId: string) {
    return await this.employeesService.getEmployeesByOrgIdAlone(orgId);
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

  @Get(':id')
  async getAnEmployeeById(@Param('id') _id: string) {
    try {
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

  @Get('company-id/:company_id')
  async getEmployeeDetailsByCompanyId(@Param('company_id') companyId: string) {
    return await this.employeesService.getEmployeeDetailByCompanyId(companyId);
  }

  @Get(':id/test/test')
  async getEmployeeDetails(@Param('id') _id: string) {
    return await this.employeesService.getEmployeeDetails(_id);
  }

  @Get('supervisors/:employee_id/subordinates')
  async getSubordinates(@Param('employee_id') employeeId: string) {
    return await this.employeesService.getSubordinates(employeeId);
  }

  /* find employee details by plantilla id */
  @Get('plantilla/:plantillaId')
  async getEmployeeDetailsByPlantillaId(@Param('plantillaId') plantillaId: string) {
    return await this.employeesService.getEmployeeDetailsByPlantillaId(plantillaId);
  }

  @Get('plantilla-positions/get-everything/:employee_id')
  async getEmployeePosition(@Param('employee_id') employeeId: string) {
    //return employeeId;
    return await this.employeesService.getEmployeePosition(employeeId);
  }
}
