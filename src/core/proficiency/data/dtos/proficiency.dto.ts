import { CompetencyModel } from 'src/core/competency-model/data/entities/competency-model.entity';

export class ProficiencyDto {
  competencyId: CompetencyModel;
  level: string;
  keyActions: string;
}

export class UpdateProficiencyDto {
  _id: string;
  keyActions: string;
}
