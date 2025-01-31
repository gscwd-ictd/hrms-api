import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SuperUserService } from 'src/core/users/services/superuser.service';

@Injectable()
export class SuperUserGuard implements CanActivate {
  constructor(private superUserService: SuperUserService) { }
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    //2. check superuser creds
    const superUser = await this.superUserService.findSuperUser(request.body);

    if (!superUser) throw new UnauthorizedException();
    const { _id, username } = superUser;
    request.user = { userId: _id, username, isSuperUser: true };
    return true;
  }
}
