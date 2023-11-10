import { CompetencyModel } from 'src/core/competency-model/data/entities/competency-model.entity';
import { ProficiencyLevel } from '../../utils/enum/proficiency.enum';

export class ProficiencyDto {
  competencyId: CompetencyModel;
  level: ProficiencyLevel;
  keyActions: string;
}

export class UpdateProficiencyDto {
  _id: string;
  keyActions: string;
}
