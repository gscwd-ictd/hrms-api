import { UserLogsService } from './../../../global/user-logs/user-logs.service';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class GetSalaryGradeInterceptor implements NestInterceptor {
  constructor(private readonly userLogsService: UserLogsService) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const user = request.session.user;
    const action = 'HRMS User: ' + user.fullName + ', viewed Salary Grade Table.';
    await this.userLogsService.saveEntity({ userId: user.employeeId, action });
    console.log(action);
    return next.handle().pipe(
      map((data: any) => {
        //c
        return data;
      }),
    );
  }
}
