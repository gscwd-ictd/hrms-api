import { PDSSkillsUpdateDTO } from './data/dtos/pds-skills.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSSkills } from './data/entities/pds-skills.entity';

@Injectable()
export class PDSSkillsService extends BaseEntityCrudService<PDSSkills> {
  constructor(@InjectRepository(PDSSkills) private pdsSkillsRepository: Repository<PDSSkills>) {
    super(pdsSkillsRepository);
  }

  async updateSkillsTransaction(transactionEntityManager: EntityManager, pdsSkillsUpdateDTO: PDSSkillsUpdateDTO, externalApplicantId: string) {
    if (pdsSkillsUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsSkillsUpdateDTO.update.map(async (skill) => {
          const { _id, ...rest } = skill;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ ...rest, externalApplicantId }));
          //else await transactionEntityManager.remove(this.createEntity(skill));
        }),
      );
    }

    if (pdsSkillsUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsSkillsUpdateDTO.deleted.map(async (skill) => {
          const { _id, ...rest } = skill;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(skill));
        }),
      );
    }
  }
}
