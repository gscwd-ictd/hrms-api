import { AuthenticatedGuard } from './../../global/auth/guards/authenticated2.guard';
import { UserLogsInterceptor } from './../../global/user-logs/interceptors/user-logs.interceptor';
import { UserRolesDTO, UserRolesAddUpdateDTO } from './data/user-roles.dto';
import { UserRolesService } from './user-roles.service';
import { Body, Controller, Delete, Param, Post, Put, Get, Patch, UseGuards, UseInterceptors, ConsoleLogger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

//@UseGuards(AuthenticatedGuard)
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Get(':user_id')
  async getUserRolesByUserId(@Param('user_id') userId: string) {
    console.log('user', userId);
    return await this.userRolesService.getUserRoleByUserId(userId, 'rsp');
  }

  //@UseInterceptors(UserLogsInterceptor)
  @Post()
  async addUserRoles(@Body() userRolesAddUpdateDTO: UserRolesAddUpdateDTO) {
    return await this.userRolesService.addUserRole(userRolesAddUpdateDTO);
  }

  @Delete(':user_id')
  async deleteUserRoles(@Param('user_id') userId: string) {
    return await this.userRolesService.deleteUserAndRoles(userId);
  }

  //@UseInterceptors(UserLogsInterceptor)
  @Patch()
  async updateUserRoles(@Body() userRoleUpdateDTO: UserRolesAddUpdateDTO) {
    return await this.userRolesService.updateUserRoles(userRoleUpdateDTO);
  }

  @MessagePattern('add_user_roles')
  async addUserRolesMS(@Payload() userRolesAddUpdateDTO: UserRolesAddUpdateDTO) {
    return await this.userRolesService.addUserRole(userRolesAddUpdateDTO);
  }

  @MessagePattern('get_user_roles_by_id_and_app')
  async getUserRolesByIdMs(@Payload() data: { userId: string; app: string }) {
    const { app, userId } = data;
    return await this.userRolesService.getUserRoleByUserId(userId, app);
  }

  @MessagePattern('update_user_roles')
  async updateUserRolesMS(@Payload() userRoleUpdateDTO: UserRolesAddUpdateDTO) {
    return await this.userRolesService.updateUserRoles(userRoleUpdateDTO);
  }

  @MessagePattern('delete_user_role_id')
  async deleteUserRolesMs(@Payload() userId: string) {
    return await this.userRolesService.deleteUserAndRoles(userId);
  }

  @MessagePattern('delete_lnd_user_roles')
  async deleteLndUserRolesMs(@Payload() userId: string) {
    return await this.userRolesService.deleteUserAndRolesByApp(userId, 'lnd');
  }

  @MessagePattern('add_lnd_user')
  async addLndUserMs(@Payload() employeeId: string) {
    return await this.userRolesService.addLndUser(employeeId);
  }

  @Post('lnd/:employee_id')
  async addLndUser(@Param('employee_id') employeeId: string) {
    return await this.userRolesService.addLndUser(employeeId);
  }
}
