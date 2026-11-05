import { Modules } from './data/modules.entity';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { ModulesType } from './data/modules.dto';
import { UserRoles } from '../data/user-roles.entity';

@Injectable()
export class ModulesService extends BaseEntityCrudService<Modules> {
  constructor(@InjectRepository(Modules) modulesRepository: Repository<Modules>) {
    super(modulesRepository);
  }

  /**
   * Creates a module and gives it, UNCHECKED (has_access = false), to every user of the same app
   * (users who already have any module of that app, e.g. all EMS users for app 'ems').
   * Users of other apps do not get it. Nobody gets a duplicate role.
   */
  async saveModule(modulesDTO: ModulesType) {
    try {
      return await getManager().transaction(async (transactionEntityManager) => {
        const module = await transactionEntityManager.getRepository(Modules).save(modulesDTO);

        const appUsers = (await transactionEntityManager.query(
          `SELECT DISTINCT ur.user_id_fk userId
             FROM user_roles ur
            INNER JOIN modules m ON m._id = ur.module_id_fk
            WHERE m.app = ? AND m._id <> ? AND ur.user_id_fk IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id_fk = ur.user_id_fk AND x.module_id_fk = ?);`,
          [module.app, module._id, module._id],
        )) as { userId: string }[];

        await Promise.all(
          appUsers.map(({ userId }) =>
            transactionEntityManager.getRepository(UserRoles).save({
              userId: { _id: userId },
              moduleId: module,
              hasAccess: false,
            }),
          ),
        );
        return module;
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
    } catch (error) { }
  }
}
