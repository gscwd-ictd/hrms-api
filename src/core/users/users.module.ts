import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/core/users/data/entities/users.entity';
import { ClientsModule } from '@nestjs/microservices';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { SuperUserService } from './services/superuser.service';
import { PlantillaPositions } from '../plantilla-positions/data/entities/plantilla-positions.entity';
import { SuperUser } from './data/entities/superuser.entity';
import { AuthModule } from 'src/global/auth/auth.module';
import { EmployeesModule } from '../employees/employees.module';
import { EmployeesService } from '../employees/employees.service';
import { RedisConfigForAuthN, RedisConfigForEmployeeMonitoring } from 'src/global/utils/config-classes/clients.config';
import { Employees } from '../employees/data/entities/employees.entity';
import { PlantillaPositionsModule } from '../plantilla-positions/plantilla-positions.module';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { OfficerInChargeModule } from '../officer-in-charge/officer-in-charge.module';
import { CommitteeMembersModule } from '../committee-members/committee-members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, SuperUser, PlantillaPositions, Employees]),
    ClientsModule.registerAsync([
      { name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN },
      { name: MicroserviceType.EMPLOYEE_MONITORING, useClass: RedisConfigForEmployeeMonitoring },
    ]),
    EmployeesModule,
    PlantillaPositionsModule,
    OfficerInChargeModule,
    CommitteeMembersModule,
  ],
  providers: [UsersService, SuperUserService, EmployeesService, PlantillaPositionsService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
