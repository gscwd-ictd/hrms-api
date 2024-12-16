import { session } from 'passport';
import { ExecutionContext, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Req, Request, Res, Response, Session } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceHelper } from 'src/global/utils/helper/microservice.helper';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { UserDto } from 'src/core/users/data/dtos/users.dto';
import { GlobalJwtService } from 'src/global/auth/services/global-jwt.service';
import { Store } from 'express-session';
import { REQUEST } from '@nestjs/core';
import { SuperUserService } from 'src/core/users/services/superuser.service';

@Injectable()
export class AuthNService extends MicroserviceHelper {
  constructor(@Inject(MicroserviceType.AUTHN) public client: ClientProxy, private readonly jwtService: GlobalJwtService, private readonly superUserService: SuperUserService) {
    super(client);
  }

  async verifyUser(token: string) {
    try {
      return this.jwtService.verifyToken(token);
    } catch (error) {
      throw new HttpException({ error: error.message, name: 'Unauthorized' }, HttpStatus.UNAUTHORIZED);
    }
  }

  async createUser(data: UserDto) {
    return await this.sendRequest({ msg: 'register_user' }, data);
  }

  async loginRemote(data: UserDto) {
    try {
      const { email, password, clientId, secret } = data;
      const superUser = await this.superUserService.findSuperUser({ username: email, password, clientId, secret });
      if (superUser) {
        return { isSuperUser: true, ...superUser };
      } else {
        const user = await this.sendRequest({ msg: 'oauth_login' }, data);
        return user;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async login(data: UserDto) {
    return await this.sendRequest({ msg: 'user.login' }, data);
  }
}
