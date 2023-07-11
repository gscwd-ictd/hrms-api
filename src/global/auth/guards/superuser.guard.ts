import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SuperUserService } from 'src/core/users/services/superuser.service';

@Injectable()
export class SuperUserGuard implements CanActivate {
  constructor(private superUserService: SuperUserService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    //const response
    //1. verify app
    //const {}
    //const token = await this.authZService.verifyAppRemote(request.body);
    //if (!token) throw new UnauthorizedException();
    //2. check superuser creds
    const superUser = await this.superUserService.findSuperUser(request.body);

    if (!superUser) throw new UnauthorizedException();
    //console.log(superUser);
    const { _id, username } = superUser;
    request.user = { userId: _id, username, isSuperUser: true };
    return true;
  }
}
