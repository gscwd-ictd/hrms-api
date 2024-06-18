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

export class CheckEmployeeTagsDto {
  employeeId: string;
  tagsId: Array<string>;
}
