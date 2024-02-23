import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { SuperUserGuard } from 'src/global/auth/guards/superuser.guard';
import { SuperUserDTO } from 'src/core/users/data/dtos/superuser.dto';
import { UsersService } from './services/users.service';
import { SuperUser } from './utils/decorators/super-user.decorator';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated.guard';
import { User } from './utils/decorators/user.decorator';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(SuperUserGuard)
  @Post('super-login')
  async superUserLogin(@SuperUser() user: SuperUserDTO) {
    const userAccess = await this.userService.asyncGetSuperUserAccess();
    console.log(userAccess);
    return { user, userAccess };
  }

  @Get()
  async getHRMSUsers() {
    return await this.userService.getHRMSUsers();
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/details')
  async getUserDetails(@User() user: any) {
    return user;
  }

  @Get('/assignable')
  async getAssignableHRMSUsers() {
    return await this.userService.getAssignableHRMSUsers('rsp');
  }

  @MessagePattern('get_assignable_hrms_users')
  async getAssignableHRMSUsersMs(@Payload() app: string) {
    return await this.userService.getAssignableHRMSUsers(app);
  }

  @MessagePattern('get_hrms_users_by_app')
  async getHRMSUsersByApp(@Payload() app: string) {
    const result = await this.userService.getHRMSUsersByApp(app);
    return result;
  }

  @MessagePattern('get_lnd_users')
  async getLndUsers(@Payload() pagination: { page: number; limit: number }) {
    return await this.userService.getLndUsers(pagination);
  }

  @MessagePattern('get_assignable_ems_users')
  async getAssignableEmsUsers() {
    return await this.userService.getAssignableEMSUsers();
  }

  @MessagePattern('get_assignable_lnd_users')
  async getAssignableLndUsers() {
    return await this.userService.getAssignableLndUsers();
  }
}
