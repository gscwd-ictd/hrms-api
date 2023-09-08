import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { RedisConfigForEmployeeMonitoring } from 'src/global/utils/config-classes/clients.config';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MicroserviceType.EMPLOYEE_MONITORING,
        useClass: RedisConfigForEmployeeMonitoring,
      },
    ]),
  ],
  providers: [HolidaysService],
  controllers: [HolidaysController],
})
export class HolidaysModule {}
