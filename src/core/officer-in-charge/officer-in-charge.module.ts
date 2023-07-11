import { OfficerInChargeViewService } from './data/officer-in-charge-view/officer-in-charge-view.service';
import { OfficerInChargeView } from 'src/core/officer-in-charge/data/officer-in-charge-view/officer-incharge.view';
import { OfficerInChargeService } from './officer-in-charge.service';
import { OfficerInCharge } from './data/officer-in-charge.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { OfficerInChargeController } from './officer-in-charge.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OfficerInCharge, OfficerInChargeView])],
  providers: [OfficerInChargeService, OfficerInChargeViewService],
  exports: [OfficerInChargeService, OfficerInChargeViewService],
  controllers: [OfficerInChargeController],
})
export class OfficerInChargeModule {}
