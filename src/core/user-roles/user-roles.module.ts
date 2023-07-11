import { UsersModule } from 'src/core/users/users.module';
import { ModulesModule } from './hrms-modules/modules.module';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';
import { UserRoles } from './data/user-roles.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([UserRoles]), ModulesModule, UsersModule],
  providers: [UserRolesService],
  controllers: [UserRolesController],
})
export class UserRolesModule {}
