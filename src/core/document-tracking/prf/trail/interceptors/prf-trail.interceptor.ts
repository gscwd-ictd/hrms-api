import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
export class PrfTrailInterceptor implements NestInterceptor {
  //1. di nya maview/update ang di kanya na prf
  //2. pag di division/department/office head di pwd gumawa ng prf
  //3. di nya pwd iapprove ang kanyang nirequest unless admin agm

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const prfDetailsId = request.params.prf_details_id;
    return next.handle().pipe(map((data: any) => ({ data })));
  }
}
