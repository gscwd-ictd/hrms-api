import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { PDSBasicPermanentAddress } from './data/entities/pds-basic-permanent-address.entity';

@Injectable()
export class PDSBasicPermanentAddressService extends BaseEntityCrudService<PDSBasicPermanentAddress> {
  constructor(@InjectRepository(PDSBasicPermanentAddress) pdsBasicPermanentAddressRepository: Repository<PDSBasicPermanentAddress>) {
    super(pdsBasicPermanentAddressRepository);
  }
}
