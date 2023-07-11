import { PDSEducationUpdateDTO } from './../data/dtos/pds-education.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, getManager, Repository } from 'typeorm';
import { PDSSchoolsAttended } from '../data/dtos/pds-education.dto';
import { PDSEducationVocational } from './data/entities/pds-education-vocational.entity';

@Injectable()
export class PDSEducationVocationalService extends BaseEntityCrudService<PDSEducationVocational> {
  constructor(@InjectRepository(PDSEducationVocational) pdsEducationVocationalRepository: Repository<PDSEducationVocational>) {
    super(pdsEducationVocationalRepository);
  }

  async updateVocationalTransaction(transactionEntityManager: EntityManager, pdsVocationalUpdateDTO: PDSEducationUpdateDTO, externalApplicantId: string) {
    if (pdsVocationalUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsVocationalUpdateDTO.update.map(async (vocationalItem) => {
          const { _id, ...rest } = vocationalItem;
          const vocationalEntity = this.createEntity({ externalApplicantId, ...rest });
          if (_id === '') await transactionEntityManager.save(vocationalEntity);
        }),
      );
    }

    if (pdsVocationalUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsVocationalUpdateDTO.deleted.map(async (vocationalItem) => {
          const { _id, ...rest } = vocationalItem;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(vocationalItem));
        }),
      );
    }
  }

  async addVocational(applicantId: string, pdsSchoolsAttended: PDSSchoolsAttended) {
    try {
      //let graduate  = [];
      const graduate = await getManager().transaction(async (transactionEntityManager) => {
        await Promise.all(
          pdsSchoolsAttended.schools.map(async (_college) => {
            return await transactionEntityManager.save(this.createEntity({ applicantId, ..._college }));
          }),
        );
      });
      return graduate;
    } catch (error) {
      throw new HttpException('Unable to add college', 500);
    }
  }
}
