import { PDSVoluntaryWorkDTO, PDSVoluntaryWorkUpdateDTO } from './data/dtos/pds-voluntary-work.dto';
import { PdsDTO } from './../../data/dtos/pds.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSVoluntaryWork } from './data/entities/pds-voluntary-work.entity';

@Injectable()
export class PDSVoluntaryWorkService extends BaseEntityCrudService<PDSVoluntaryWork> {
  constructor(@InjectRepository(PDSVoluntaryWork) pdsVoluntaryWorkRepository: Repository<PDSVoluntaryWork>) {
    super(pdsVoluntaryWorkRepository);
  }

  async updateVoluntaryWorkTransaction(transactionEntityManager: EntityManager, pdsVoluntaryWorkUpdateDTO: PDSVoluntaryWorkUpdateDTO, externalApplicantId: string) {
    if (pdsVoluntaryWorkUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsVoluntaryWorkUpdateDTO.update.map(async (voluntaryWorkItem) => {
          const { _id, ...rest } = voluntaryWorkItem;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ ...rest, externalApplicantId }));
          //else await transactionEntityManager.remove(this.createEntity(voluntaryWorkItem));
        }),
      );
    }

    if (pdsVoluntaryWorkUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsVoluntaryWorkUpdateDTO.deleted.map(async (voluntaryWorkItem) => {
          const { _id, ...rest } = voluntaryWorkItem;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(voluntaryWorkItem));
        }),
      );
    }
  }
}
