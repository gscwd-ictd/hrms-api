import { ExternalApplicantsService } from './../external-applicants.service';
import { GlobalJwtService } from 'src/global/auth/services/global-jwt.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
@Injectable()
export class ExternalApplicantLoginGuard implements CanActivate {
  constructor(private externalApplicantsService: ExternalApplicantsService) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization.split(' ')[1];
    const applicantDetails = await this.externalApplicantsService.verifyExternalApplicantByToken(bearerToken);

    request.session.applicantId = applicantDetails.applicantId._id;
    request.session.vppId = applicantDetails.vppId;
    return true;
  }
}
