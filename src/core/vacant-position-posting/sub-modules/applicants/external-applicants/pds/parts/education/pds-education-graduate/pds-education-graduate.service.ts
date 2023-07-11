import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, getManager, Repository } from 'typeorm';
import { PDSEducationUpdateDTO, PDSSchoolsAttended } from '../data/dtos/pds-education.dto';
import { PDSEducationGraduate } from './data/entities/pds-education-graduate.entity';

@Injectable()
export class PDSEducationGraduateService extends BaseEntityCrudService<PDSEducationGraduate> {
  constructor(@InjectRepository(PDSEducationGraduate) pdsEducationGraduate: Repository<PDSEducationGraduate>) {
    super(pdsEducationGraduate);
  }

  async updateGraduateTransaction(transactionEntityManager: EntityManager, pdsGraduateUpdateDTO: PDSEducationUpdateDTO, externalApplicantId: string) {
    if (pdsGraduateUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsGraduateUpdateDTO.update.map(async (graduateItem) => {
          const { _id, ...rest } = graduateItem;
          const graduateEntity = this.createEntity({ externalApplicantId, ...rest });
          if (_id === '') await transactionEntityManager.save(graduateEntity);
          //else await transactionEntityManager.remove(this.createEntity(graduateItem));
        }),
      );
    }

    if (pdsGraduateUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsGraduateUpdateDTO.deleted.map(async (graduateItem) => {
          const { _id, ...rest } = graduateItem;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(graduateItem));
        }),
      );
    }
  }
  async addGraduate(applicantId: string, pdsSchoolsAttended: PDSSchoolsAttended) {
    try {
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
