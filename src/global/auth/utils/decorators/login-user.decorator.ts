import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from 'src/core/users/data/dtos/users.dto';

export const LoginUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const userDTO: UserDto = request.body;
  return {
    //userId: request.session.user,
    userDetails: request.session.user,
    email: request.body.email,
    accessToken: request.bearerToken,
  };
});
