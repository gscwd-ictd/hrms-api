import { IsEmail } from 'class-validator';
import { UserRole } from 'src/core/users/utils/enums/role.enum';
import { EmployeeSchedule, RestDays } from '../../utils/employee.type';

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
