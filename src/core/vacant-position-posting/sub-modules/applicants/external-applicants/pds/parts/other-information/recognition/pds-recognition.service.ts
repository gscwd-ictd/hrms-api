import { PDSRecognitionUpdateDTO } from './data/dtos/pds-recognition.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EntityManager, Repository } from 'typeorm';
import { PDSRecognition } from './data/entities/pds-recognition.entity';

@Injectable()
export class PDSRecognitionService extends BaseEntityCrudService<PDSRecognition> {
  constructor(@InjectRepository(PDSRecognition) pdsRecognitionRepository: Repository<PDSRecognition>) {
    super(pdsRecognitionRepository);
  }

  async updateRecognitionTransaction(transactionEntityManager: EntityManager, pdsRecognitionUpdateDTO: PDSRecognitionUpdateDTO, externalApplicantId: string) {
    if (pdsRecognitionUpdateDTO.update.length > 0) {
      await Promise.all(
        pdsRecognitionUpdateDTO.update.map(async (recognition) => {
          const { _id, ...rest } = recognition;
          if (_id === '') await transactionEntityManager.save(this.createEntity({ externalApplicantId, ...rest }));
          //else await transactionEntityManager.remove(this.createEntity(recognition));
        }),
      );
    }

    if (pdsRecognitionUpdateDTO.deleted.length > 0) {
      await Promise.all(
        pdsRecognitionUpdateDTO.deleted.map(async (recognition) => {
          const { _id, ...rest } = recognition;
          if (_id !== '') await transactionEntityManager.remove(this.createEntity(recognition));
        }),
      );
    }
  }
}
