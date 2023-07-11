import { session } from 'passport';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LogoutGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    request.session.destroy();

    response.clearCookie('accessToken', {
      signed: false,
      secure: false,
      maxAge: 0,
      path: '/',
    });

    response.clearCookie('ssid_hrms', {
      httpOnly: true,
      signed: false,
      secure: false,
      maxAge: 0,
      path: '/',
    });

    response.clearCookie('userId', {
      signed: false,
      secure: false,
      maxAge: 0,
      path: '/',
    });

    response.clearCookie('isSuperUser', {
      signed: false,
      secure: false,
      maxAge: 0,
      path: '/',
    });

    return true;
  }
}
