import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { ClientsModule } from '@nestjs/microservices';
import { StatsService } from './stats.service';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { RedisConfigForAuthN } from 'src/global/utils/config-classes/clients.config';
import { PlantillaPositionsModule } from '../plantilla-positions/plantilla-positions.module';
import { PrfTrailModule } from '../document-tracking/prf/trail/prf-trail.module';
import { OrganizationModule } from '../organization/organization.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    PlantillaPositionsModule,
    PrfTrailModule,
    OrganizationModule,
    EmployeesModule,
    ClientsModule.registerAsync([{ name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN }]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
