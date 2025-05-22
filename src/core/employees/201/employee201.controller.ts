import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Employee201Service } from './employee201.service';
import { Employee201Dto, UpdateEmployee201Dto } from './dtos/employee201.dto';

@Controller({ path: '201' })
export class Employee201Controller {
  constructor(private readonly employee201Service: Employee201Service) {}

  @Get(':employee_id')
  async getEmployee201(@Param('employee_id') employeeId: string) {
    return await this.employee201Service.getEmployee201(employeeId);
  }

  @Post()
  async addEmployee201Record(@Body() employee201Dto: Employee201Dto) {
    return await this.employee201Service.addEmployee201Record(employee201Dto);
  }

  @Put()
  async updateEmployee201Record(@Body() updateEmployee201Record: UpdateEmployee201Dto) {
    return await this.employee201Service.updateEmployee201Record(updateEmployee201Record);
  }

  @Delete(':employee_201_id')
  async deleteEmployee201Record(@Param('employee_201_id') _id: string) {
    return await this.employee201Service.deleteEmployee201Record(_id);
  }
}
