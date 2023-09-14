import { Domain } from 'src/core/domain/data/entities/domain.entity';
import { UpdateProficiencyDto } from 'src/core/proficiency/data/dtos/proficiency.dto';

export class CompetencyDto {
  domainId: Domain;
  code: string;
  name: string;
  definition: string;
}

export class UpdateCompetencyDto {
  competencyId: string;
  code: string;
  name: string;
  desc: string;
  proficiencyKeyActions: UpdateProficiencyDto[];
}
