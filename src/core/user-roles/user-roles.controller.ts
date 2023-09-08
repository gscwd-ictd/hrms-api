import { AuthenticatedGuard } from './../../global/auth/guards/authenticated2.guard';
import { UserLogsInterceptor } from './../../global/user-logs/interceptors/user-logs.interceptor';
import { UserRolesDTO, UserRolesAddUpdateDTO } from './data/user-roles.dto';
import { UserRolesService } from './user-roles.service';
import { Body, Controller, Delete, Param, Post, Put, Get, Patch, UseGuards, UseInterceptors } from '@nestjs/common';

//@UseGuards(AuthenticatedGuard)
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Get(':user_id')
  async getUserRolesByUserId(@Param('user_id') userId: string) {
    return await this.userRolesService.getUserRoleByUserId(userId);
  }

  //@UseInterceptors(UserLogsInterceptor)
  @Post()
  async addUserRoles(@Body() userRolesAddUpdateDTO: UserRolesAddUpdateDTO) {
    return await this.userRolesService.addUserRole(userRolesAddUpdateDTO);
  }

  @Delete(':user_id')
  async deleteUserRoles(@Param('user_id') userId: string) {
    //return await this.userRolesService.removeEntity(_id);
    return await this.userRolesService.deleteUserAndRoles(userId);
  }

  //@UseInterceptors(UserLogsInterceptor)
  @Patch()
  async updateUserRoles(@Body() userRoleUpdateDTO: UserRolesAddUpdateDTO) {
    return await this.userRolesService.updateUserRoles(userRoleUpdateDTO);
  }
}
