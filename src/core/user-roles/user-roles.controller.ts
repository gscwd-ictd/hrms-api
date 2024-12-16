import { MsExceptionFilter } from 'src/global/utils/filters/rpc-exception.filter';
import { AuthenticatedGuard } from './../../global/auth/guards/authenticated2.guard';
import { UserLogsInterceptor } from './../../global/user-logs/interceptors/user-logs.interceptor';
import { UserRolesDTO, UserRolesAddUpdateDTO } from './data/user-roles.dto';
import { UserRolesService } from './user-roles.service';
import { Body, Controller, Delete, Param, Post, Put, Get, Patch, UseGuards, UseInterceptors, ConsoleLogger, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

//@UseGuards(AuthenticatedGuard)
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) { }

  @Get(':user_id')
  async getUserRolesByUserId(@Param('user_id') userId: string) {
    try {
      return await this.userRolesService.getUserRoleByUserId(userId, 'rsp');
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  //@UseInterceptors(UserLogsInterceptor)
  @Post()
  async addUserRoles(@Body() userRolesAddUpdateDTO: UserRolesAddUpdateDTO) {
    try {
      return await this.userRolesService.addUserRole(userRolesAddUpdateDTO);
    } catch (error) {
      throw new RpcException(error.message);
    }

  }

  @Delete(':user_id')
  async deleteUserRoles(@Param('user_id') userId: string) {
    try {
      return await this.userRolesService.deleteUserAndRoles(userId);
    } catch (error) {
      throw new RpcException(error.message);
    }

  }

  //@UseInterceptors(UserLogsInterceptor)
  @Patch()
  async updateUserRoles(@Body() userRoleUpdateDTO: UserRolesAddUpdateDTO) {
    try {
      return await this.userRolesService.updateUserRoles(userRoleUpdateDTO);
    } catch (error) {
      throw new RpcException(error.message);
    }

  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('add_user_roles')
  async addUserRolesMS(@Payload() userRolesAddUpdateDTO: UserRolesAddUpdateDTO) {
    try {
      return await this.userRolesService.addUserRole(userRolesAddUpdateDTO);
    } catch (error) {
      throw new RpcException(error.message);
    }

  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_user_roles_by_id_and_app')
  async getUserRolesByIdMs(@Payload() data: { userId: string; app: string }) {
    try {
      const { app, userId } = data;
      return await this.userRolesService.getUserRoleByUserId(userId, app);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('update_user_roles')
  async updateUserRolesMS(@Payload() userRoleUpdateDTO: UserRolesAddUpdateDTO) {
    try {
      return await this.userRolesService.updateUserRoles(userRoleUpdateDTO);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('delete_user_role_id')
  async deleteUserRolesMs(@Payload() userId: string) {
    try {
      return await this.userRolesService.deleteUserAndRoles(userId);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('delete_lnd_user_roles')
  async deleteLndUserRolesMs(@Payload() userId: string) {
    try {
      return await this.userRolesService.deleteUserAndRolesByApp(userId, 'lnd');
    }
    catch (error) {
      throw new RpcException(error.message);
    }

  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('add_lnd_user')
  async addLndUserMs(@Payload() employeeId: string) {
    return await this.userRolesService.addLndUser(employeeId);
  }

  @Post('lnd/:employee_id')
  async addLndUser(@Param('employee_id') employeeId: string) {
    return await this.userRolesService.addLndUser(employeeId);
  }
}
