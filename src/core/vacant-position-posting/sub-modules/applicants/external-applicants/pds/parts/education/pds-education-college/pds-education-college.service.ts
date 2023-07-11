import { PDSEducationUpdateDTO } from './../data/dtos/pds-education.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, getManager, Repository } from 'typeorm';
import { PDSSchoolsAttended } from '../data/dtos/pds-education.dto';
import { PDSEducationCollege } from './data/entities/pds-education-college.entity';

@Injectable()
export class PDSEducationCollegeService extends BaseEntityCrudService<PDSEducationCollege> {
  constructor(@InjectRepository(PDSEducationCollege) pdsEducationCollegeRepository: Repository<PDSEducationCollege>) {
    super(pdsEducationCollegeRepository);
  }

  async updateCollegeTransaction(transactionEntityManager: EntityManager, pdsCollegeUpdateDTO: PDSEducationUpdateDTO, externalApplicantId: string) {
    if (pdsCollegeUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsCollegeUpdateDTO.update.map(async (collegeItem) => {
          const { _id, ...rest } = collegeItem;
          const collegeEntity = this.createEntity({ externalApplicantId, ...rest });
          if (_id === '') return await transactionEntityManager.save(this.createEntity(collegeEntity));
          //else return await transactionEntityManager.remove(collegeItem);
        }),
      );
    }
    if (pdsCollegeUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsCollegeUpdateDTO.deleted.map(async (collegeItem) => {
          const { _id, ...rest } = collegeItem;
          if (_id !== '') return await transactionEntityManager.remove(this.createEntity({ ...collegeItem, externalApplicantId }));
          //else return await transactionEntityManager.remove(collegeItem);
        }),
      );
    }
  }

  async addCollege(applicantId: string, pdsSchoolsAttended: PDSSchoolsAttended) {
    try {
      //let college  = [];
      const college = await getManager().transaction(async (transactionEntityManager) => {
        await Promise.all(
          pdsSchoolsAttended.schools.map(async (_college) => {
            return await transactionEntityManager.save(this.createEntity({ applicantId, ..._college }));
          }),
        );
      });
      return college;
    } catch (error) {
      throw new HttpException('Unable to add college', 500);
    }
  }
}
