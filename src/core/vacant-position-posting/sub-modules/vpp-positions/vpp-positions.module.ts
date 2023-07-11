import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VppPositions } from './data/entities/vpp-positions.entity';
import { VppPositionsService } from './vpp-positions.service';

@Module({
  imports: [TypeOrmModule.forFeature([VppPositions])],
  providers: [VppPositionsService],
  exports: [VppPositionsService],
})
export class VppPositionsModule {}
