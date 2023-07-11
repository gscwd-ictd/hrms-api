import { session } from 'passport';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExternalApplicantsLogin = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const externalApplicantId = request.session.applicantId;
  const vppId = request.session.vppId;
  if (externalApplicantId && vppId) return { externalApplicantId, vppId };
  return null;
});
