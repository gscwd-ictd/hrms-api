import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { CompetencyModelOccupation } from './data/entities/competency-model-occupation.entity';
import { Competencies } from './utils/types/competency-model-occupation.types';

@Injectable()
export class CompetencyModelOccupationService extends BaseEntityCrudService<CompetencyModelOccupation> {
  constructor(@InjectRepository(CompetencyModelOccupation) private readonly competencyModelOccupationRepository: Repository<CompetencyModelOccupation>) {
    super(competencyModelOccupationRepository);
  }

  async removeCompetenciesOccupation(occupationId: string, competencies: Competencies) {
    try {
      const result = await this.entityRepository.query('DELETE FROM competency_model_occupation WHERE occupation_id_fk = ? AND competency_model_id_fk IN (?)', [
        occupationId,
        competencies.competencyIds,
      ]);
      if (result.affectedRows > 0) return { occupationId, competencies };
    } catch (error) {}
  }

  async addCompetenciesToOccupation(occupationId: string, competencies: Competencies) {
    try {
      await Promise.all(
        competencies.competencyIds.map(async (competencyModelId) => {
          await this.saveEntity({ occupationId, competencyModelId });
        }),
      );
      return { occupationId, competencyIds: competencies.competencyIds };
    } catch (error) {}
  }

  async getCompetencyModelsPerOccupation(id: string) {
    try {
      return await this.competencyModelOccupationRepository
        .createQueryBuilder('cmo')
        .select('code')
        .addSelect('name')
        .addSelect('cm.desc', 'description')
        .innerJoin('competency_model', 'cm', 'cm._id = cmo.competency_model_id_fk')
        .innerJoin('domain', 'd', 'd._id = cm.domain_id_fk')
        .where("d.type = 'Functional' AND occupation_id_fk = :id;", { id })
        .orderBy('code', 'ASC')
        .getRawMany();
    } catch (error) {}
  }
}
