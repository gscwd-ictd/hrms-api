import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proficiency } from 'src/core/proficiency/data/entities/proficiency.entity';
import { ProficiencyDto } from 'src/core/proficiency/data/dtos/proficiency.dto';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';

@Injectable()
export class ProficiencyService extends BaseEntityCrudService<Proficiency> {
  constructor(
    @InjectRepository(Proficiency)
    private readonly prof: Repository<Proficiency>,
  ) {
    super(prof);
  }

  async getProficienciesByCompId(competencyId: string) {
    return await this.prof.find({ where: { competencyId } });
  }
}
