import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficePositions } from './data/entities/office-positions.entity';
import { OfficePositionsService } from './office-positions.service';

@Module({
  imports: [TypeOrmModule.forFeature([OfficePositions])],
  providers: [OfficePositionsService],
})
export class OfficePositionsModule {}
