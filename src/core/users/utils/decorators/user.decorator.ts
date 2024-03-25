import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const userDetails = ctx.switchToHttp().getRequest();
  console.log('User Custom Decorator');
  console.log(userDetails.session);
  return userDetails.session.user;
});
