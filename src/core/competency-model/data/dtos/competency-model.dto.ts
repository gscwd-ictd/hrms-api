import { Domain } from 'src/core/domain/data/entities/domain.entity';

export class CompetencyDto {
  domainId: Domain;
  code: string;
  name: string;
  definition: string;
}
