import { Injectable } from '@nestjs/common';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { NosiNosa } from './data/entities/nosi-nosa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NosiNosaService extends BaseEntityCrudService<NosiNosa> {
  constructor(
    @InjectRepository(NosiNosa)
    private readonly nosiNosaRepository: Repository<NosiNosa>,
  ) {
    super(nosiNosaRepository);
  }
}
