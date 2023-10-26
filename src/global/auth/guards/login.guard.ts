import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/core/users/services/users.service';
import { AuthNService } from '../services/auth-n.service';

@Injectable()
export class LogInGuard {
  constructor(private authNService: AuthNService, private userService: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    //1. verify app through the microservice
    //const token = await this.authZService.verifyAppRemote(request.body);
    //if (!token) throw new UnauthorizedException();
    //2. get _id from microservice
    const user = await this.authNService.loginRemote(request.body);
    console.log(user);
    if (!user) throw new UnauthorizedException();
    if (!user.isSuperUser) {
      console.log(user);
      const userFromLocal = await this.userService.getAuthorizedUserById(user._id);
      console.log(userFromLocal);
      //4. set token, user session and userId in request object
      console.log(request);
      request.bearerToken = user.accessToken;
      request.session.user = userFromLocal;
      request.userId = userFromLocal._id;
      return true;
    }
    //3. match _id with the _id in local db
    const { _id, username } = user;
    request.user = { userId: _id, username, isSuperUser: true };
    request.session.user = request.user;
    return true;
  }
}
