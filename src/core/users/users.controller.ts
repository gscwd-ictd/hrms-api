import { Controller, Get, Post, UseFilters, UseGuards } from '@nestjs/common';
import { SuperUserGuard } from 'src/global/auth/guards/superuser.guard';
import { SuperUserDTO } from 'src/core/users/data/dtos/superuser.dto';
import { UsersService } from './services/users.service';
import { SuperUser } from './utils/decorators/super-user.decorator';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated.guard';
import { User } from './utils/decorators/user.decorator';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { MsExceptionFilter } from 'src/global/utils/filters/rpc-exception.filter';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) { }

  @UseGuards(SuperUserGuard)
  @Post('super-login')
  async superUserLogin(@SuperUser() user: SuperUserDTO) {
    const userAccess = await this.userService.asyncGetSuperUserAccess();
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

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_assignable_hrms_users')
  async getAssignableHRMSUsersMs(@Payload() app: string) {
    try {
      return await this.userService.getAssignableHRMSUsers(app);
    } catch (error) {
      throw new RpcException(error.message);
    }

  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_hrms_users_by_app')
  async getHRMSUsersByApp(@Payload() app: string) {
    try {
      const result = await this.userService.getHRMSUsersByApp(app);
      return result;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_lnd_users')
  async getLndUsers(@Payload() pagination: { page: number; limit: number }) {
    try {
      return await this.userService.getLndUsers(pagination);
    } catch (error) {
      throw new RpcException(error.message);
    }

  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_assignable_ems_users')
  async getAssignableEmsUsers() {
    try {
      return await this.userService.getAssignableEMSUsers();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_assignable_lnd_users')
  async getAssignableLndUsers() {
    try {
      return await this.userService.getAssignableLndUsers();
    } catch (error) {
      throw new RpcException(error.message);
    }

  }
}
