import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository, EntityManager } from 'typeorm';
import { PDSEligibilityDTO, PDSEligibilityUpdateDTO } from './data/dtos/pds-eligibility.dto';
import { PDSEligibility } from './data/entities/pds-eligibility.entity';

@Injectable()
export class PDSEligibilityService extends BaseEntityCrudService<PDSEligibility> {
  constructor(@InjectRepository(PDSEligibility) pdsEligibilityRepository: Repository<PDSEligibility>) {
    super(pdsEligibilityRepository);
  }

  async updateEligibilityTransaction(transactionEntityManager: EntityManager, pdsEligibilityUpdateDTO: PDSEligibilityUpdateDTO, externalApplicantId: string) {
    if (pdsEligibilityUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsEligibilityUpdateDTO.update.map(async (eligibility) => {
          const { examDateFrom, examDateTo, examDate, _id, ...rest } = eligibility;

          if (_id === '') {
            //const { _id } = eligibility;
            const { to, from } = examDate;
            let _examDate = '';
            if (to === null) _examDate = from;
            else _examDate = from + ' to ' + to;
            await transactionEntityManager.save(this.createEntity({ externalApplicantId, ...rest, examDate: _examDate }));
          } //else {
          //   await transactionEntityManager.remove(this.createEntity(rest));
          // }
        }),
      );
    }

    if (pdsEligibilityUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsEligibilityUpdateDTO.deleted.map(async (eligibility) => {
          const { examDateFrom, examDateTo, examDate, ...rest } = eligibility;
          if (eligibility._id !== '') await transactionEntityManager.remove(this.createEntity(rest));
        }),
      );
    }
  }

  async addEligibility(externalApplicantId: string, pdsEligibilityDTO: PDSEligibilityDTO[]) {
    try {
      //let  eligibilities : PDSEligibility[] = [];

      const eligibilities = await Promise.all(
        pdsEligibilityDTO.map(async (pdsEligibility) => {
          return await this.saveEntity({ externalApplicantId, ...pdsEligibility });
        }),
      );
      return eligibilities;
    } catch (error) {
      throw new HttpException('Unable to save Eligibility', 500);
    }
  }
}
