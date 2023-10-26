import { Modules } from './data/modules.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { ModulesType } from './data/modules.dto';
import { UserRoles } from '../data/user-roles.entity';

@Injectable()
export class ModulesService extends BaseEntityCrudService<Modules> {
  constructor(@InjectRepository(Modules) modulesRepository: Repository<Modules>) {
    super(modulesRepository);
  }

  async saveModule(modulesDTO: ModulesType) {
    try {
      const module = await this.saveEntity(modulesDTO);
      const users = await this.entityRepository.query(`SELECT _id FROM users;`);
      const updateResult = await getManager().transaction(async (transactionEntityManager) => {
        const userRoles = await Promise.all(
          users.map(async (user) => {
            const { _id } = user;
            const userModule = await transactionEntityManager.getRepository(UserRoles).save({
              userId: _id,
              moduleId: module,
              hasAccess: false,
            });
            return userModule;
          }),
        );
        return userRoles;
      });
      return updateResult;
    } catch (error) {
      console.log(error);
    }
  }

  async getModulesByApp(app: string) {
    try {
      return await this.entityRepository.find({ where: { app }, order: { module: 'ASC' } });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async deleteModuleById(_id: string) {
    try {
      await this.removeEntity(_id);
    } catch (error) {}
  }
}
