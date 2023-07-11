import { PDSReferencesUpdateDTO } from './data/dtos/pds-references.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSReferences } from './data/entities/pds-references.entity';

@Injectable()
export class PDSReferencesService extends BaseEntityCrudService<PDSReferences> {
  constructor(@InjectRepository(PDSReferences) pdsReferencesRepository: Repository<PDSReferences>) {
    super(pdsReferencesRepository);
  }

  async updateReferencesTransaction(transactionEntityManager: EntityManager, pdsReferencesUpdateDTO: PDSReferencesUpdateDTO, externalApplicantId: string) {
    if (pdsReferencesUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsReferencesUpdateDTO.update.map(async (reference) => {
          const { _id, ...rest } = reference;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ externalApplicantId, ...rest }));
        }),
      );
    }

    if (pdsReferencesUpdateDTO.deleted.length > 0)
      await Promise.all(
        pdsReferencesUpdateDTO.deleted.map(async (reference) => {
          const { _id, ...rest } = reference;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(reference));
        }),
      );
  }
}
