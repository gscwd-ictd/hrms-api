import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './data/entities/domain.entity';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';

@Injectable()
export class DomainService extends BaseEntityCrudService<Domain> {
  constructor(@InjectRepository(Domain) private readonly domainRepository: Repository<Domain>) {
    super(domainRepository);
  }
}
