import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { Occupation } from './data/entities/occupation.entity';

@Injectable()
export class OccupationService extends BaseEntityCrudService<Occupation> {
  constructor(
    @InjectRepository(Occupation)
    public readonly occupationRepository: Repository<Occupation>,
  ) {
    super(occupationRepository);
  }

  async getAllOccupations() {
    try {
      return await this.occupationRepository.find({ order: { occupationName: 'ASC' } });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async findOccupationById(_id: string) {
    try {
      return await this.entityRepository.findOne({ where: { _id } });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }
}
