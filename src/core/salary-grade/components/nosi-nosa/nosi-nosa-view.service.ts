import { Injectable } from '@nestjs/common';
import { NosiNosaView } from './views/nosi-nosa.view';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';

@Injectable()
export class NosiNosaViewService extends BaseEntityCrudService<NosiNosaView> {
  constructor(
    @InjectRepository(NosiNosaView)
    private readonly nosiNosaRepository: Repository<NosiNosaView>,
  ) {
    super(nosiNosaRepository);
  }
}
