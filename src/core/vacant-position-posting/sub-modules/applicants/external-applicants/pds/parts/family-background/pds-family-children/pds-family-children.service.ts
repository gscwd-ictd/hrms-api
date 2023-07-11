import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { captureRejections } from 'events';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository, TypeORMError } from 'typeorm';
import { PDSFamilyChildrenDTO, PDSFamilyChildrenUpdateDTO } from './data/dto/pds-family-children.dto';
import { PDSFamilyChildren } from './data/entities/pds-family-children.entity';

@Injectable()
export class PDSFamilyChildrenService extends BaseEntityCrudService<PDSFamilyChildren> {
  constructor(@InjectRepository(PDSFamilyChildren) pdsFamilyChildrenRepository: Repository<PDSFamilyChildren>) {
    super(pdsFamilyChildrenRepository);
  }

  async updateChildrenTransaction(transactionEntityManager: EntityManager, pdsChildrenFamilyDTO: PDSFamilyChildrenUpdateDTO, externalApplicantId: string) {
    if (pdsChildrenFamilyDTO.update.length > 0) {
      await Promise.all(
        pdsChildrenFamilyDTO.update.map(async (child) => {
          const { _id, ...rest } = child;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ ...rest, externalApplicantId }));
        }),
      );
    }

    if (pdsChildrenFamilyDTO.deleted.length > 0) {
      await Promise.all(
        pdsChildrenFamilyDTO.deleted.map(async (child) => {
          const { _id, ...rest } = child;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(child));
        }),
      );
    }
  }

  async addChildren(externalApplicantId: string, pdsFamilyChildrenDTO: PDSFamilyChildrenDTO[]) {
    try {
      //let children : PDSFamilyChildren[] = [];
      const children = await Promise.all(
        pdsFamilyChildrenDTO.map(async (child) => {
          return await this.saveEntity({ externalApplicantId, ...child });
        }),
      );
      return children;
    } catch (error) {
      throw new HttpException('Unable to save Children', 500);
    }
  }
}
