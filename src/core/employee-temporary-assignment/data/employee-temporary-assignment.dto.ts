import { PartialType } from '@nestjs/swagger';
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

  @IsNotEmpty({ message: 'date to must not be empty.' })
  @IsDateString()
  dateTo: Date;
}

export class UpdateEmployeeTemporaryAssignmentDto extends PartialType(CreateEmployeeTemporaryAssignmentDto) {
  @IsNotEmpty()
  @IsEnum(EmployeeTemporaryAssignmentStatus)
  status: EmployeeTemporaryAssignmentStatus;
}
