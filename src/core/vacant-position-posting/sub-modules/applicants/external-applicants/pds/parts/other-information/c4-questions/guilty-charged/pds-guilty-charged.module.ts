import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSGuiltyCharged } from './data/entities/pds-guilty-charged.entity';
import { PDSGuiltyChargedController } from './pds-guilty-charged.controller';
import { PDSGuiltyChargedService } from './pds-guilty-charged.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSGuiltyCharged])],
  providers: [PDSGuiltyChargedService],
  controllers: [PDSGuiltyChargedController],
  exports: [PDSGuiltyChargedService],
})
export class PDSGuiltyChargedModule {}
