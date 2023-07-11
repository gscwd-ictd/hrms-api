import { HiringProcessResultsService } from './hiring-process-results.service';
import { HiringProcessResultsView } from './data/hiring-process-results.view';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([HiringProcessResultsView])],
  providers: [HiringProcessResultsService],
  exports: [HiringProcessResultsService],
})
export class HiringProcessResultsModule {}
