import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSIndigenousPWDSoloParent } from './data/entities/pds-indigenous-pwd-soloparent.entity';

@Injectable()
export class PDSIndigenousPWDSoloParentService extends BaseEntityCrudService<PDSIndigenousPWDSoloParent> {
  constructor(@InjectRepository(PDSIndigenousPWDSoloParent) pdsIndigenousPWDSoloParentRepository: Repository<PDSIndigenousPWDSoloParent>) {
    super(pdsIndigenousPWDSoloParentRepository);
  }
}
