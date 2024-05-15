import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EmployeeTemporaryAssignmentService } from './employee-temporary-assignment.service';
import { CreateEmployeeTemporaryAssignmentDto, UpdateEmployeeTemporaryAssignmentDto } from '../data';

@Controller('temporary-assignment')
export class EmployeeTemporaryAssignmentController {
  constructor(private readonly employeeTemporaryAssignmentService: EmployeeTemporaryAssignmentService) {}

  @Get()
  async findAllEmployeeTemporaryAssignment() {
    return await this.employeeTemporaryAssignmentService.findAllEmployeeTemporaryAssignment();
  }

  @Post()
  async createEmployeeTemporaryAssignment(@Body() data: CreateEmployeeTemporaryAssignmentDto) {
    return await this.employeeTemporaryAssignmentService.createEmployeeTemporaryAssignment(data);
  }

  @Get(':id')
  async findEmployeeTemporaryAssignmentById(@Param('id') id: string) {
    return await this.employeeTemporaryAssignmentService.findEmployeeTemporaryAssignmentById(id);
  }

  @Patch(':id')
  async updateEmployeeTemporaryAssignmentById(@Param('id') id: string, @Body() data: UpdateEmployeeTemporaryAssignmentDto) {
    return await this.employeeTemporaryAssignmentService.updateEmployeeTemporaryAssignmentById(id, data);
  }

  @Delete(':id')
  async removeEmployeeTemporaryAssingmentById(@Param('id') id: string) {
    return await this.employeeTemporaryAssignmentService.deleteEmployeTemporaryAssignmentById(id);
  }
}
