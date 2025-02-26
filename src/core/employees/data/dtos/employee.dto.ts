import { IsEmail } from 'class-validator';
import { UserRole } from 'src/core/users/utils/enums/role.enum';
import { RestDays } from '../../utils/employee.type';
import { PickType } from '@nestjs/swagger';
import { Sex } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/utils/enums/pds.enum';

export class EmployeeDTO {
  _id?: string;
  applicantId: string;
  @IsEmail()
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  nameExtension?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  positionId?: string;
  userRole: UserRole;
  scheduleId: string;
  restDays: RestDays[];
}

export class UpdateBasicEmployeeInfoDto extends PickType(EmployeeDTO, ['firstName', 'middleName', 'lastName', 'nameExtension', 'titlePrefix', 'titleSuffix'
]) {

  employeeId: string;

  sex: Sex;

  phoneNumber: number;

  email: string;

  dailyRate: number;

  birthday: Date;

  natureOfAppointment: string;
}
