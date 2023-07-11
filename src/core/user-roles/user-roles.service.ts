import { UserRolesDTO, UserRolesAddUpdateDTO } from './data/user-roles.dto';
import { UsersService } from 'src/core/users/services/users.service';
import { UserRoles } from './data/user-roles.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRolesService extends BaseEntityCrudService<UserRoles> {
  constructor(@InjectRepository(UserRoles) private readonly userRoles: Repository<UserRoles>, private readonly usersService: UsersService) {
    super(userRoles);
  }

  // async addUserRole(userRolesDTO: UserRolesDTO) {
  //   return await this.saveEntity(userRolesDTO);
  // }

  async deleteUserAndRoles(userId: string) {
    try {
      const deleteResult = await this.entityRepository.query(`DELETE FROM user_roles WHERE user_id_fk = ?`, [userId]);
      //console.log(deleteResult);

      const deletedUser = await this.usersService.removeEntity(userId);
      const deletedUserName = (await this.entityRepository.query(`SELECT get_employee_fullname(_id) fullName FROM users WHERE _id=?;`, [userId]))[0];
      return { userId, ...deletedUserName };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async addUserRole(userRolesAddUpdateDTO: UserRolesAddUpdateDTO) {
    try {
      const { employeeId, userRoles } = userRolesAddUpdateDTO;

      const user = await this.usersService.saveEntity({ _id: employeeId, employeeId, photoUrl: 'http://192.168.99.124/images/tony.jpg' });
      console.log(user);
      const result = await Promise.all(
        userRoles.map(async (userRole) => {
          const { module, slug, url, ...rest } = userRole;
          return await this.saveEntity({ userId: user._id, ...rest });
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getUserRoleByUserId(userId: string) {
    try {
      // const userInfo = (
      //   await this.entityRepository.query(
      //     `
      // SELECT get_employee_fullname2(?) fullName,
      // get_employee_assignment(?) assignment,
      // get_employee_position(?) position FROM users`,
      //     [userId, userId, userId],
      //   )
      // )[0];

      const userRoles = await this.entityRepository.query(
        `
      SELECT 
        ur._id _id, 
        ur.module_id_fk moduleId,
        m.module module, 
        ur.has_access hasAccess,
        m.slug
          FROM user_roles ur 
          INNER JOIN modules m ON m._id = ur.module_id_fk 
        WHERE ur.user_id_fk = ?;
      `,
        [userId],
      );
      return userRoles;
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserRoles(userRoleUpdateDTO: UserRolesAddUpdateDTO) {
    const userRoles = await Promise.all(
      userRoleUpdateDTO.userRoles.map(async (userRole) => {
        const { _id, module, slug, ...rest } = userRole;
        const updateResult = await this.updateEntity({ _id, ...rest });
        return updateResult;
      }),
    );
    return userRoles;
  }
}
