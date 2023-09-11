import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VppPsb } from './data/entities/vpp-psb.entity';
import { VppPsbController } from './vpp-psb.controller';
import { VppPsbService } from './vpp-psb.service';

@Module({
  imports: [TypeOrmModule.forFeature([VppPsb])],
  providers: [VppPsbService],
  exports: [VppPsbService],
  controllers: [VppPsbController],
})
export class VppSchedulePsbModule {}
