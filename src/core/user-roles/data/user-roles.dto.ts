import { Employees } from './../../employees/data/entities/employees.entity';
import { Users } from 'src/core/users/data/entities/users.entity';
import { Modules } from '../hrms-modules/data/modules.entity';

export class UserRolesDTO {
  _id?: string;
  userId: Users;
  moduleId: Modules;
  hasAccess: boolean;
  module?: string;
  slug?: string;
  url?: string;
}

export type UserRoleAddUpdate = Omit<UserRolesDTO, 'userId'>;

export class UserRolesAddUpdateDTO {
  employeeId?: Users | Employees;
  userRoles: UserRoleAddUpdate[];
}

//export class
