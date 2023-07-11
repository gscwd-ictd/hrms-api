import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { CommitteeDto } from './data/dtos/committee.dto';
import { Committees } from './data/entities/committees.entity';

@Injectable()
export class CommitteesService extends BaseEntityCrudService<Committees> {
  constructor(@InjectRepository(Committees) private readonly committeeRepository: Repository<Committees>) {
    super(committeeRepository);
  }

  async getCommittees() {
    try {
      return await this.entityRepository.find({ order: { name: 'ASC' } });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async getSingleCommittee(_id: string) {
    try {
      return await this.findEntityById(_id);
    } catch (error) {}
  }

  async addCommittee(committeeDto: CommitteeDto) {
    try {
      return await this.saveEntity(committeeDto);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateCommittee(_id: string, committeeDto: CommitteeDto) {
    try {
      return await this.updateEntity({ _id, ...committeeDto });
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async deleteCommittee(committeeId: string) {
    try {
      return await this.removeEntity(committeeId);
    } catch (error) {
      if (error.status === 404) {
        throw new HttpException('There are members currently assigned to this committee. Please unassign them first.', HttpStatus.FORBIDDEN);
      }
    }
  }
}
