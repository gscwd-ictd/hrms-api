import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DepartmentDto } from './data/dtos/department.dto';
import { DepartmentService } from './department.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly deptService: DepartmentService) {}

  @Get()
  async findDepartments() {
    return await this.deptService.findAllDepartments();
  }

  @Get(':id')
  async findDepartmentById(_id: string) {
    return await this.deptService.findEntityById(_id);
  }

  @Post()
  async addDepartment(@Body() deptDto: DepartmentDto) {
    return await this.deptService.saveEntity(deptDto);
  }

  @Put(':id')
  async updateDepartment(@Param('id') _id: string, @Body() deptDto: DepartmentDto) {
    return await this.deptService.updateEntity({ _id, ...deptDto });
  }

  @Delete(':id')
  async deleteDepartment(@Param('id') _id: string) {
    return await this.deptService.removeEntity(_id);
  }
}
