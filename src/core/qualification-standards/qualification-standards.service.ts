import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QualificationStandards } from 'src/core/qualification-standards/data/entities/qualification-standards.entity';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { QualificationStandardsDto } from './data/dtos/qualification-standards.dto';

@Injectable()
export class QualificationStandardsService extends BaseEntityCrudService<QualificationStandards> {
  constructor(
    @InjectRepository(QualificationStandards)
    public readonly qualificationStandardsRepository: Repository<QualificationStandards>,
  ) {
    super(qualificationStandardsRepository);
  }
  async getQsByPositionId(positionId: string) {
    return await this.qualificationStandardsRepository.findOneOrFail({ where: { positionId }, loadRelationIds: true });
  }

  async updateQSByPositionId(positionId: string, qsDTO: QualificationStandardsDto) {
    const { education, eligibility, training, experience } = qsDTO;
    const result = await this.entityRepository
      .createQueryBuilder()
      .update()
      .set({ education, eligibility, training, experience })
      .where('position_id_fk=:positionId', { positionId })
      .execute();
    if (result.affected > 0) return { positionId, ...qsDTO };
  }

  async getAllQs() {
    return await this.qualificationStandardsRepository
      .createQueryBuilder('qs')
      .select('position_id_fk', 'positionId')
      .addSelect('item_number', 'itemNumber')
      .addSelect('position_title', 'positionTitle')
      .addSelect('eligibility')
      .addSelect('education')
      .addSelect('experience')
      .addSelect('training')
      .innerJoin('plantilla_positions', 'pp', 'pp._id = position_id_fk')
      .getRawMany();
  }
}
