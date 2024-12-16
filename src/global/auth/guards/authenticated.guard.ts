import { session } from 'passport';
import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException, Session } from '@nestjs/common';
import { GlobalJwtService } from 'src/global/auth/services/global-jwt.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly jwtService: GlobalJwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.session.user;
    if (user) return true;
    return false;
  }
}
