import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { RedisConfigForAuthN } from '../clients.config';

@Module({
  imports: [ClientsModule.registerAsync([{ name: MicroserviceType.AUTHN, useClass: RedisConfigForAuthN }])],
  exports: [],
})
export class MicroserviceModule {}
