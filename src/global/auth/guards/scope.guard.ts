import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { GlobalJwtService } from 'src/global/auth/services/global-jwt.service';
//** run this guard assuming its 2nd or 3rd party and JWT valid */
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly jwtService: GlobalJwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.session.user) {
      if (!request.headers.authorization) throw new UnauthorizedException();
      const bearerToken = request.headers.authorization.split(' ')[1];
      try {
        const verifiedApp = await this.jwtService.verifyToken(bearerToken);

        if (!verifiedApp) throw new UnauthorizedException();
        //1. decode jwt
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
        //3. find if the client app has the scope { method: get, route:  }
        let found = false;
        jwtScopeKuno.map((jwtScopeEl) => {
          if (jwtScopeEl.method === requestedResource.method && jwtScopeEl.path === requestedResource.path) found = true;
        });
        //4. if found, allow access else throw unauthorizedexception error;
        if (!found) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        throw new UnauthorizedException(error.message);
      }
    }
    return true;
  }
}
