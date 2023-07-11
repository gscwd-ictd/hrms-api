import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { GlobalJwtService } from 'src/global/auth/services/global-jwt.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly jwtService: GlobalJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.session.isSuperUser) {
      //2nd or 3rd party
      throw new UnauthorizedException();
    }
    return true;
  }
}
