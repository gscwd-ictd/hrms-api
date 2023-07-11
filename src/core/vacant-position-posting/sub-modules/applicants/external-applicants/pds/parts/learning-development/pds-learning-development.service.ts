import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSLearningDevelopmentDTO, PDSLearningDevelopmentUpdateDTO } from './data/dtos/pds-learning-development.dto';
import { PDSLearningDevelopment } from './data/entities/pds-learning-development.entity';

@Injectable()
export class PDSLearningDevelopmentService extends BaseEntityCrudService<PDSLearningDevelopment> {
  constructor(@InjectRepository(PDSLearningDevelopment) pdsLearningDevelopmentRepository: Repository<PDSLearningDevelopment>) {
    super(pdsLearningDevelopmentRepository);
  }

  async updateLearningDevelopmentTransaction(
    transactionEntityManager: EntityManager,
    pdsLearningDevelopmentUpdateDTO: PDSLearningDevelopmentUpdateDTO,
    externalApplicantId: string,
  ) {
    if (pdsLearningDevelopmentUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsLearningDevelopmentUpdateDTO.update.map(async (learningDevelopmentItem) => {
          const { _id, ...rest } = learningDevelopmentItem;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ ...rest, externalApplicantId }));
          //else await transactionEntityManager.remove(this.createEntity(learningDevelopmentItem));
        }),
      );
    }

    if (pdsLearningDevelopmentUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsLearningDevelopmentUpdateDTO.deleted.map(async (learningDevelopmentItem) => {
          const { _id, ...rest } = learningDevelopmentItem;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(learningDevelopmentItem));
        }),
      );
    }
  }

  async addLearningDevelopment(externalApplicantId: string, pdsLearningDevelopmentDTO: PDSLearningDevelopmentDTO[]) {
    try {
      //let pdsLearningDevelopment : PDSLearningDevelopment[] = [];

      const pdsLearningDevelopment = await Promise.all(
        pdsLearningDevelopmentDTO.map(async (pdsLearningDevelopmentItem) => {
          return await this.saveEntity({ externalApplicantId, ...pdsLearningDevelopmentItem });
        }),
      );

      return pdsLearningDevelopment;
    } catch (error) {
      throw new HttpException('Error saving Learning and Development', 500);
    }
  }
}
