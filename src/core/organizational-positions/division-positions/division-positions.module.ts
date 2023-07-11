import { Module } from '@nestjs/common';
import { DivisionPositionsService } from './division-positions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DivisionPositions } from './data/dtos/division-positions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DivisionPositions])],
  providers: [DivisionPositionsService],
})
export class DivisionPositionsModule {}
