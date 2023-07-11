import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/global/auth/services/email.service';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { RedisConfigForAuthN, RedisConfigForEmployeeMonitoring, RedisConfigForMailMS, RedisConfigForPDSMS } from 'src/global/utils/config-classes/clients.config';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { PlantillaPositions } from '../plantilla-positions/data/entities/plantilla-positions.entity';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { OfficerInChargeModule } from '../officer-in-charge/officer-in-charge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employees, PlantillaPositions]),
    ClientsModule.registerAsync([
      { name: MicroserviceType.EMAIL, useClass: RedisConfigForMailMS },
      { name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN },
      { name: MicroserviceType.PDS, useClass: RedisConfigForPDSMS },
      { name: MicroserviceType.EMPLOYEE_MONITORING, useClass: RedisConfigForEmployeeMonitoring },
    ]),
    OfficerInChargeModule,
  ],
  providers: [EmployeesService, PlantillaPositionsService, EmailService],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
