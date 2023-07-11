import { CanActivate, ExecutionContext } from '@nestjs/common';

export class PrfTrailGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //1. di nya maview/update ang di kanya na prf
    //2. pag di division/department/office head di pwd gumawa ng prf
    //3. di nya pwd iapprove ang kanyang nirequest unless admin agm
    return true;
  }
}
