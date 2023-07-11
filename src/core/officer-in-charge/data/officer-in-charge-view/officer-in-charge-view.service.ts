import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficerInChargeView } from './officer-incharge.view';

@Injectable()
export class OfficerInChargeViewService extends BaseEntityCrudService<OfficerInChargeView> {
  constructor(@InjectRepository(OfficerInChargeView) officerInChargeViewRepository: Repository<OfficerInChargeView>) {
    super(officerInChargeViewRepository);
  }
}
