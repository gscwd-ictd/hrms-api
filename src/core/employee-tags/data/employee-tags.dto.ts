import { PickType } from '@nestjs/swagger';
import { Employees } from 'src/core/employees/data/entities/employees.entity';

export class EmployeeTagsDto {
  id: string;
  employeeId: Employees;
  tagId: string;
}

export class CreateEmployeeTagsDto {
  employees: Employees[];
  tags: string[];
}

export class DeleteEmployeeTagDto {
  employeeId: string;
  tagId: string;
}
