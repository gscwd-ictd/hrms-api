import { Module } from '@nestjs/common';
import { DepartmentPositionService } from './department-positions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentPositions } from './data/entities/department-positions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentPositions])],
  providers: [DepartmentPositionService],
})
export class DepartmentPositionsModule {}
