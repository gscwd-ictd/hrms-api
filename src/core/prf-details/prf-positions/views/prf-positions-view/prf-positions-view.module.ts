import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrfPositionsView } from './data/prf-positions.view';
import { PrfPositionsViewService } from './prf-positions-view.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrfPositionsView])],
  providers: [PrfPositionsViewService],
  exports: [PrfPositionsViewService],
})
export class PrfPositionsViewModule {}
