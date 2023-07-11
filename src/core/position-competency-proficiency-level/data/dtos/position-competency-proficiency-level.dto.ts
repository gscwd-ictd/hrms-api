import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Proficiency } from 'src/core/proficiency/data/entities/proficiency.entity';
import { PcplUpdateType } from '../../utils/types/pcpl-update.type';
import { PositionCompetencyProficiencyLevel } from '../entities/position-competency-proficiency-level.entity';

export class PcplDTO {
  proficiencyIds: string[];
}

export class PcplDeleteDTO {
  pcplIds: PositionCompetencyProficiencyLevel[];
}

export class PcplUpdateDTO {
  core: PcplUpdateType[];
  functional?: PcplUpdateType[];
  crossCutting?: PcplUpdateType[];
  managerial?: PcplUpdateType[];
}
