import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SuperUserDTO } from 'src/core/users/data/dtos/superuser.dto';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { SuperUser } from '../data/entities/superuser.entity';

@Injectable()
export class SuperUserService extends BaseEntityCrudService<SuperUser> {
  constructor(@InjectRepository(SuperUser) private superUserRepository: Repository<SuperUser>) {
    super(superUserRepository);
  }

  async findSuperUser(superUserDto: SuperUserDTO) {
    try {
      const { username, password } = superUserDto;
      const superUser = await this.superUserRepository.findOne({ where: { username, password } });
      //console.log(superUser, 'asd');
      if (!superUser) return null;
      return superUser;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
