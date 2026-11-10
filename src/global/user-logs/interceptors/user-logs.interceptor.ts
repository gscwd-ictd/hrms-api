import { SUPER_USER_LOG_ID, UserLogsService } from './../user-logs.service';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class UserLogsInterceptor implements NestInterceptor {
  constructor(private readonly userLogsService: UserLogsService) { }

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();
    const user = request.session?.user;
    // log only actions done by a signed-in user (super user -> SUPER_USER_LOG_ID)
    const employeeId = user?.isSuperUser ? SUPER_USER_LOG_ID : user?.employeeId;

    if (employeeId) await this.userLogsService.addLogs({
      userId: employeeId,
      route: request.url,
      method: request.method,
      body: JSON.stringify(request.body),
    });

    return next.handle().pipe(
      map((data: any) => {
        return data;
      }),
    );
  }
}
