import { Modules } from './data/modules.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModulesDTO, ModulesType } from './data/modules.dto';

@Injectable()
export class ModulesService extends BaseEntityCrudService<Modules> {
  constructor(@InjectRepository(Modules) modulesRepository: Repository<Modules>) {
    super(modulesRepository);
  }

  async saveModule(modulesDTO: ModulesType) {
    try {
      console.log(modulesDTO);
      return await this.saveEntity(modulesDTO);
    } catch (error) {
      console.log(error);
    }
  }
}
