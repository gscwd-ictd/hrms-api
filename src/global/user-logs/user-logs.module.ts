import { UserLogsController } from './user-logs.controller';
import { UserLogsService } from './user-logs.service';
import { UserLogs } from './data/user-logs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserLogs])],
  providers: [UserLogsService],
  exports: [UserLogsService],
  controllers: [UserLogsController],
})
export class UserLogsModule {}
