import { HttpException, HttpStatus, Injectable, Headers, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //context: any, status?: any
  constructor(private reflect: Reflector) {
    super();
  }

  handleRequest<TUser>(err: any, user: TUser, info: any, context: ExecutionContext): any {
    const auth: Request = context.switchToHttp().getRequest();
    if (info) {
      throw new HttpException(info.message, HttpStatus.UNAUTHORIZED);
    }
    return { user };
  }
}
