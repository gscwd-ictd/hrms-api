import { PDSWorkExperienceDTO, PDSWorkExperienceUpdateDTO } from './data/dto/pds-workexperience.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSWorkExperience } from './data/entities/pds-workexperience.entity';

@Injectable()
export class PDSWorkExperienceService extends BaseEntityCrudService<PDSWorkExperience> {
  constructor(@InjectRepository(PDSWorkExperience) pdsWorkExperienceRepository: Repository<PDSWorkExperience>) {
    super(pdsWorkExperienceRepository);
  }

  async getWorkExperiences(externalApplicantId: string) {
    try {
      return await this.entityRepository.find({
        where: { externalApplicantId },
      });
    } catch (error) {}
  }

  async updateWorkExperienceTransaction(transactionEntityManager: EntityManager, pdsWorkExperienceDTO: PDSWorkExperienceUpdateDTO, externalApplicantId: string) {
    if (pdsWorkExperienceDTO.update.length > 0) {
      await Promise.all(
        pdsWorkExperienceDTO.update.map(async (workExperienceItem) => {
          const { _id, ...rest } = workExperienceItem;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ ...rest, externalApplicantId }));
          else await transactionEntityManager.getRepository(PDSWorkExperience).createQueryBuilder().update().set(workExperienceItem).where({ _id }).execute();
        }),
      );
    }
  }
}
