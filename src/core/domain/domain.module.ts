import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from './data/entities/domain.entity';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { ClientsModule } from '@nestjs/microservices';
import { RedisConfigForEmployeesMS } from 'src/global/utils/config-classes/clients.config';

@Module({
  imports: [TypeOrmModule.forFeature([Domain])],
  providers: [DomainService],
  exports: [DomainService],
  controllers: [DomainController],
})
export class DomainModule {}
