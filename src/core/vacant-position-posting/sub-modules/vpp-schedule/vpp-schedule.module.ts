import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VppSchedule } from './data/entities/vpp-schedule.entity';
import { VppScheduleService } from './vpp-schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([VppSchedule])],
  providers: [VppScheduleService],
  exports: [VppScheduleService],
})
export class VppScheduleModule {}
