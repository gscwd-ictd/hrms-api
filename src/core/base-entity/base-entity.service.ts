import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

export class BaseEntityCrudService<Ent> {
  constructor(public entityRepository: Repository<Ent>) {}

  async findEntityAll() {
    try {
      return await this.entityRepository.find();
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }

  async findEntityById(_id: string): Promise<any> {
    try {
      return await this.entityRepository.findOneOrFail(_id, { loadRelationIds: false });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  createEntity(data: object) {
    return this.entityRepository.create(data);
  }

  async saveEntity(data: object) {
    try {
      return await this.entityRepository.save(data);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async updateEntity(data: any) {
    try {
      const entity = this.createEntity(data);
      if ((await this.entityRepository.update(data._id, data)).affected > 0) return entity;
      else throw new HttpException('No Content', HttpStatus.NOT_FOUND);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async removeEntity(id: string) {
    try {
      const theEntity = await this.findEntityById(id);
      return await this.entityRepository.remove(theEntity);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
