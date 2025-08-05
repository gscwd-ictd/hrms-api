import { PartialType, PickType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { EmployeeTemporaryAssignmentStatus } from 'src/global/utils/enums/employee-temporary-assignment.enum';

export class CreateEmployeeTemporaryAssignmentDto {
  @IsNotEmpty({ message: 'employee id must not be empty.' })
  @IsUUID()
  employeeId: string;

  @IsNotEmpty({ message: 'organization id must not be empty.' })
  @IsUUID()
  organizationId: string;

  @IsNotEmpty({ message: 'date from must not be empty.' })
  @IsDateString()
  dateFrom: Date;
}

export class UpdateEmployeeTemporaryAssignmentDto {
  @IsNotEmpty()
  @IsUUID()
  _id: string;

  @IsNotEmpty()
  @IsEnum(EmployeeTemporaryAssignmentStatus)
  status: EmployeeTemporaryAssignmentStatus;

  @IsNotEmpty({ message: 'date to must not be empty.' })
  @IsDateString()
  dateTo: Date;
}
