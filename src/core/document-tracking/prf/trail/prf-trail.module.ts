import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrfPositionsViewModule } from 'src/core/prf-details/prf-positions/views/prf-positions-view/prf-positions-view.module';
import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { VppPositionsModule } from 'src/core/vacant-position-posting/sub-modules/vpp-positions/vpp-positions.module';
import { VacantPositionPostingModule } from 'src/core/vacant-position-posting/vacant-position-posting.module';
import { VacantPositionPostingService } from 'src/core/vacant-position-posting/vacant-position-posting.service';
import { PrfTrail } from './data/entities/prf-trail.entity';
import { PrfTrailController } from './prf-trail.controller';
import { PrfTrailService } from './prf-trail.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrfTrail]), PrfPositionsViewModule, VppPositionsModule, VacantPositionPostingModule],
  providers: [PrfTrailService],
  controllers: [PrfTrailController],
  exports: [TypeOrmModule.forFeature([PrfTrail]), PrfTrailService],
})
export class PrfTrailModule {}
