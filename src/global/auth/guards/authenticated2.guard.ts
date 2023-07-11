import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException, Session } from '@nestjs/common';
import { session } from 'passport';
import { GlobalJwtService } from 'src/global/auth/services/global-jwt.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly jwtService: GlobalJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
  /*
    const request = context.switchToHttp().getRequest();
    //console.log(request.headers.cookie.split('; userId=')[1].split(';')[0]);
    let isSuperUser = false;
    console.log(request.headers.cookie);
    try {
      isSuperUser = <boolean>request.headers.cookie.split('; ')[0].split('isSuperUser=')[1];
      console.log(isSuperUser);
    } catch {}
    if (!isSuperUser) {
      if (!request.session.user) {
        if (!request.headers.authorization) {
          throw new UnauthorizedException();
        }
        //2nd or 3rd party
        const bearerToken = request.headers.authorization.split(' ')[1];
        try {
          const verifiedApp = await this.jwtService.verifyToken(bearerToken);
          console.log(bearerToken);
          if (!verifiedApp) throw new UnauthorizedException();
          //1. decode jwt
          //console.log(request);
          const jwtScopeKuno = [
            {
              path: '/api/occupations',
              method: 'get',
            },
            {
              path: '/api/occupations/:id',
              method: 'get',
            },
            {
              path: '/api/sg',
              method: 'get',
            },
            {
              path: '/api/occupations/test-post',
              method: 'post',
            },
          ];
          //2. check scope of request
          /////////test scope variable
          const requestedResource = {
            path: request.route.path,
            method: request.method.toLowerCase(),
          };
          console.log(requestedResource);
          //3. find if the client app has the scope { method: get, route:  }
          var found = false;
          jwtScopeKuno.map((jwtScopeEl) => {
            if (jwtScopeEl.method === requestedResource.method && jwtScopeEl.path === requestedResource.path) found = true;
          });
          //4. if found, allow access else throw unauthorizedexception error;
          if (!found) {
            console.log("Out of the client's scope");
            throw new UnauthorizedException();
          }
        } catch (error) {
          console.log(error);
          throw new UnauthorizedException();
        }
      }
    }
  */
    return true;
  }
}
