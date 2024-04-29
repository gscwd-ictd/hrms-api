import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrfPositionsViewModule } from 'src/core/prf-details/prf-positions/views/prf-positions-view/prf-positions-view.module';
import { VppPositionsModule } from 'src/core/vacant-position-posting/sub-modules/vpp-positions/vpp-positions.module';
import { VacantPositionPostingModule } from 'src/core/vacant-position-posting/vacant-position-posting.module';
import { PrfTrail } from './data/entities/prf-trail.entity';
import { PrfTrailController } from './prf-trail.controller';
import { PrfTrailService } from './prf-trail.service';
import { PrfTrailMsController } from './prf-trail-ms.controller';
import { EmployeesModule } from 'src/core/employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([PrfTrail]), PrfPositionsViewModule, VppPositionsModule, VacantPositionPostingModule, EmployeesModule],
  providers: [PrfTrailService],
  controllers: [PrfTrailController, PrfTrailMsController],
  exports: [TypeOrmModule.forFeature([PrfTrail]), PrfTrailService],
})
export class PrfTrailModule {}
