import { notArchivedPositionSql } from 'src/global/utils/archived-position.util';
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
    // no QS yet: empty fields instead of a 404 (the position page shows an empty form to fill in)
    return (
      (await this.qualificationStandardsRepository.findOne({ where: { positionId }, loadRelationIds: true })) ??
      ({ positionId, education: null, training: null, eligibility: null, experience: null } as unknown as QualificationStandards)
    );
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

    // the position has no qualification standards yet (e.g. a new position): create them
    await this.entityRepository.query(
      `INSERT INTO qualification_standards (created_at, updated_at, _id, position_id_fk, education, training, eligibility, experience)
       SELECT NOW(6), NOW(6), UUID(), _id, ?, ?, ?, ? FROM plantilla_positions WHERE _id = ?;`,
      [education ?? null, training ?? null, eligibility ?? null, experience ?? null, positionId],
    );
    return { positionId, ...qsDTO };
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
      // archived positions ("*", separated employees) are not listed
      .where(notArchivedPositionSql('pp'))
      .getRawMany();
  }
}
