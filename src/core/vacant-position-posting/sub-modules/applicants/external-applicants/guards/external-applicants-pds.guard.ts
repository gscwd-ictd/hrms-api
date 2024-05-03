import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ExternalApplicantsPDSGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(request.session);
    console.log('Applicant: ', request.session.applicantId);
    console.log('VPP: ', request.session.vppId);
    if (request.session.applicantId && request.session.vppId) return true;
  }
}
