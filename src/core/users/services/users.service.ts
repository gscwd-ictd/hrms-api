import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SuperUserDTO } from 'src/core/users/data/dtos/superuser.dto';
import { UserDto } from 'src/core/users/data/dtos/users.dto';
import { handleRpcError } from 'src/global/utils/helper/error/rpc/rpc-error-handler';
import { Repository } from 'typeorm';
import { Users } from 'src/core/users/data/entities/users.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EmployeesService } from 'src/core/employees/employees.service';

@Injectable()
export class UsersService extends BaseEntityCrudService<Users> {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly employeesService: EmployeesService,
  ) {
    super(userRepository);
  }

  async createUser(user: UserDto) {
    //
  }

  async superUserLogin(superUser: SuperUserDTO) {
    //
    console.log();
  }

  async getAssignableEMSUsers() {
    try {
      const assignables = await this.entityRepository.query(
        `
         SELECT 
            emp._id employeeId, 
            get_employee_fullname2(emp._id) fullName,
            pp.position_title positionTitle
                FROM employees emp 
           INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
         AND emp._id 
         NOT IN (
        SELECT employee_id_fk FROM users 
            INNER JOIN employees ON employees._id = users.employee_id_fk
            INNER JOIN user_roles ur ON ur.user_id_fk = employees._id
            INNER JOIN modules m ON m._id = ur.module_id_fk 
        WHERE m.app = 'ems'
         ) 
         ORDER BY get_employee_fullname2(emp._id) ASC;
      `,
      );
      const result = await Promise.all(
        assignables.map(async (assignable) => {
          const { employeeId, fullName, positionTitle } = assignable;
          return {
            label: fullName,
            value: {
              employeeId,
              fullName,
              positionTitle,
            },
          };
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async getAssignableLndUsers(pagination: { page: number; limit: number }) {
    try {
      const { page, limit } = pagination;
      const assignables = (
        await this.entityRepository.query(
          `
        CALL sp_get_assignable_lnd_users(?,?)
      `,
          [page, limit],
        )
      )[0];
      const result = await Promise.all(
        assignables.map(async (assignable) => {
          const { employeeId, fullName, positionTitle } = assignable;
          return {
            employeeId,
            fullName,
            positionTitle,
          };
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async getAssignableHRMSUsers(app: string) {
    try {
      const assignables = await this.entityRepository.query(
        `
      SELECT assignable.employeeId employeeId,assignable.fullName fullName, assignable.positionTitle positionTitle
      FROM 
      ((SELECT 
            emp._id employeeId, 
            get_employee_fullname2(emp._id) fullName,
            pp.position_title positionTitle
                FROM employees emp 
           INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
           INNER JOIN division_positions dp ON dp.position_id_fk = pp._id 
           INNER JOIN divisions d ON d._id= dp.division_id_fk 
           INNER JOIN departments dep ON dep._id = d.department_id_fk 
         WHERE dep.name='Human Resource Department' 
         AND emp._id NOT IN 
         (SELECT employee_id_fk FROM users 
            INNER JOIN employees ON employees._id = users.employee_id_fk
            INNER JOIN user_roles ur ON ur.user_id_fk = employees._id
            INNER JOIN modules m ON m._id = ur.module_id_fk 
        WHERE m.app = ?) 
         ORDER BY get_employee_fullname2(emp._id) ASC)
         UNION
         (SELECT 
            emp._id employeeId, 
            get_employee_fullname2(emp._id) fullName,
            pp.position_title positionTitle
                FROM employees emp 
           INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
           INNER JOIN department_positions dp ON dp.position_id_fk = pp._id 
           INNER JOIN departments dep ON dep._id = dp.department_id_fk 
         WHERE dep.name='Human Resource Department' 
         AND emp._id 
         NOT IN (
         SELECT employee_id_fk FROM users 
            INNER JOIN employees ON employees._id = users.employee_id_fk
            INNER JOIN user_roles ur ON ur.user_id_fk = employees._id
            INNER JOIN modules m ON m._id = ur.module_id_fk 
        WHERE m.app = ?
       ) 
         ORDER BY get_employee_fullname2(emp._id) ASC)
         UNION 
         (
         SELECT 
            emp._id employeeId, 
            get_employee_fullname2(emp._id) fullName,
            pp.position_title positionTitle
                FROM employees emp 
           INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
           INNER JOIN office_positions op ON op.position_id_fk = pp._id 
           INNER JOIN office o ON o._id = op.office_id_fk 
         WHERE pp.position_title='Assistant General Manager' AND o.name='Office of the Assistant General Manager for Administration' 
         AND emp._id 
         NOT IN (
        SELECT employee_id_fk FROM users 
            INNER JOIN employees ON employees._id = users.employee_id_fk
            INNER JOIN user_roles ur ON ur.user_id_fk = employees._id
            INNER JOIN modules m ON m._id = ur.module_id_fk 
        WHERE m.app = ?
         ) 
         ORDER BY get_employee_fullname2(emp._id) ASC)) as assignable ORDER BY assignable.fullName ASC;
      `,
        [app, app, app],
      );
      const result = await Promise.all(
        assignables.map(async (assignable) => {
          const { employeeId, fullName, positionTitle } = assignable;
          return {
            label: fullName,
            value: {
              employeeId,
              fullName,
              positionTitle,
            },
          };
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async getHRMSUsers() {
    try {
      return await this.entityRepository.query(`
      SELECT employee_id_fk employeeId,get_employee_fullname2(employee_id_fk) fullName 
          FROM users u 
       INNER JOIN employees emp ON emp._id = u.employee_id_fk
       ORDER BY get_employee_fullname2(employee_id_fk) ASC
       ;`);
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async getHRMSUsersByApp(app: string) {
    //
    try {
      return await this.entityRepository.query(
        `
        SELECT distinct employee_id_fk employeeId,get_employee_fullname2(employee_id_fk) fullName 
          FROM users u 
          INNER JOIN employees emp ON emp._id = u.employee_id_fk 
          INNER JOIN user_roles ur ON emp._id =  ur.user_id_fk 
          INNER JOIN modules m ON m._id = ur.module_id_fk 
        WHERE m.app = ? 
        ORDER BY get_employee_fullname2(employee_id_fk) ASC
       ;`,
        [app],
      );
    } catch (error) {}
  }

  async asyncGetSuperUserAccess() {
    const userAccessResult = await this.entityRepository.query(
      `SELECT DISTINCT CONCAT(UPPER(SUBSTRING((REPLACE(REPLACE(m.url,'/',''),'-','_')),1,1)),LOWER(SUBSTRING((REPLACE(REPLACE(m.url,'/',''),'-','_')),2))) userAccess 
            FROM user_roles ur 
        INNER JOIN users u ON u._id = ur.user_id_fk 
        INNER JOIN modules m ON m._id = ur.module_id_fk 
      `,
    );

    const userAccess = await Promise.all(
      userAccessResult.map(async (userAccessItems) => {
        return { I: 'access', this: userAccessItems.userAccess };
      }),
    );
    return userAccess;
  }

  async getAuthorizedUserById(_id: string) {
    try {
      const user = await this.entityRepository.findOneOrFail({ where: { _id } });
      const userDetails = await this.entityRepository
        .createQueryBuilder('u')
        .select('emp._id', 'employeeId')
        .addSelect('get_employee_fullname(emp._id)', 'fullName')
        .addSelect('emp.first_name', 'firstName')
        .addSelect('emp.middle_name', 'middleName')
        .addSelect('emp.last_name', 'lastName')
        .addSelect('emp.name_extension', 'nameExtension')
        .innerJoin('employees', 'emp', 'emp._id = u.employee_id_fk')
        .where('emp._id=:employeeId', { employeeId: _id })
        .getRawOne();
      //let userAccessItems;

      const userAccessResult = await this.entityRepository.query(
        `SELECT 
          CONCAT(UPPER(SUBSTRING((REPLACE(REPLACE(m.url,'/',''),'-','_')),1,1)),LOWER(SUBSTRING((REPLACE(REPLACE(m.url,'/',''),'-','_')),2))) userAccess 
                   FROM user_roles ur 
          INNER JOIN users u ON u._id = ur.user_id_fk 
          INNER JOIN modules m ON m._id = ur.module_id_fk 
          WHERE u._id = ? and has_access=1;`,
        [_id],
      );

      const userAccess = await Promise.all(
        userAccessResult.map(async (userAccessItems) => {
          return { I: 'access', this: userAccessItems.userAccess };
        }),
      );

      const photoUrl = await this.employeesService.getEmployeePhotoUrl(_id);

      const email = await this.employeesService.findEmailAddressById(_id);

      const salaryGrade = await this.employeesService.getMonthHourlyRateByEmployeeId(_id);

      console.log('EMAIL ADDRESS ', email);

      console.log(userAccess);
      return { ...user, email, photoUrl, ...userDetails, userAccess, isSuperUser: false, salaryGradeAmount: salaryGrade.monthlyRate };
    } catch (error) {
      console.log(error);
      handleRpcError(error);
    }
  }
}
