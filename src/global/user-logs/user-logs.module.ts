import { UserLogsController } from './user-logs.controller';
import { UserLogsService } from './user-logs.service';
import { UserLogs } from './data/user-logs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from '@nestjs/common';
import { EmployeesModule } from 'src/core/employees/employees.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserLogs]), EmployeesModule],
  providers: [UserLogsService],
  exports: [UserLogsService],
  controllers: [UserLogsController],
})
export class UserLogsModule {}
