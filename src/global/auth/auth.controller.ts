import { UsersService } from 'src/core/users/services/users.service';
import { AuthenticatedGuard } from './guards/authenticated2.guard';
import { AuthNService } from './services/auth-n.service';
import { Body, Controller, Get, Post, UseGuards, Session, ExecutionContext, Req, Res } from '@nestjs/common';
import { UserDto } from '../../core/users/data/dtos/users.dto';
import { LogInGuard } from './guards/login.guard';
import { SuperUserDTO } from 'src/core/users/data/dtos/superuser.dto';
import { SuperUserGuard } from './guards/superuser.guard';
import { EmailService } from './services/email.service';
import { SuperUser } from '../../core/users/utils/decorators/super-user.decorator';
import { LoginUser } from './utils/decorators/login-user.decorator';
import { AuthenticatedUser } from './utils/types/user-credentials.type';
import { LogoutGuard } from './guards/logout.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private emailService: EmailService, private readonly authNService: AuthNService, private readonly usersService: UsersService) { }

  @UseGuards(LogInGuard)
  @Post('login')
  async loginRemote(@LoginUser() user: AuthenticatedUser) {
    return user;
  }

  @UseGuards(SuperUserGuard)
  @Post('super-login')
  async superUserLogin(@SuperUser() user: SuperUserDTO) {
    const userAccess = await this.usersService.asyncGetSuperUserAccess();
    return { user, userAccess };
  }

  @UseGuards(LogoutGuard)
  @Post('logout2')
  async logout2() {
    return {
      logout: 'success',
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Set-Cookie', [
      'ssid_hrms=deleted; Max-Age=0; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'userId=deleted; Max-Age=0; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'isSuperUser=deleted; Max-Age=0; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]);
    return {
      logout: 'success',
    };
  }
}
