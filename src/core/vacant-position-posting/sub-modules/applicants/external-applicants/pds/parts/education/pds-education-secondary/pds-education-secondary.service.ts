import { PDSEducationDTO } from './../data/dtos/pds-education.dto';
import { HttpException, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSEducationSecondary } from './data/entities/pds-education-secondary.entity';

@Injectable()
export class PDSEducationSecondaryService extends BaseEntityCrudService<PDSEducationSecondary> {
  constructor(@InjectRepository(PDSEducationSecondary) pdsEducationSecondaryRepository: Repository<PDSEducationSecondary>) {
    super(pdsEducationSecondaryRepository);
  }

  async updateSecondaryTransaction(transactionEntityManager: EntityManager, pdsEducationSecondaryDTO: PDSEducationDTO, externalApplicantId: string) {
    const existingSecondary = await this.entityRepository.findOne({ where: { externalApplicantId } });
    if (existingSecondary)
      await transactionEntityManager.getRepository(PDSEducationSecondary).createQueryBuilder().update().set(pdsEducationSecondaryDTO).where({ externalApplicantId }).execute();
    else await transactionEntityManager.save(this.createEntity({ ...pdsEducationSecondaryDTO, externalApplicantId }));
  }

  async deleteSecondary(@Param('applicant_id') externalApplicantId: string) {
    const secondary = await this.entityRepository.findOne({ where: { externalApplicantId } });
    if ((await this.entityRepository.createQueryBuilder().delete().where('external_applicant_id_fk = :externalApplicantId', { externalApplicantId }).execute()).affected > 0)
      return secondary;
    throw new HttpException('PDS record not found', 404);
  }
}
