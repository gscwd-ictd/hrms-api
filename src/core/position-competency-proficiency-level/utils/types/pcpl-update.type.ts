import { PositionCompetencyProficiencyLevel } from '../../data/entities/position-competency-proficiency-level.entity';

/**
 * @type Type to be used for updating PCPL;
 *
 */
export type PcplUpdateType = {
  pcplId: PositionCompetencyProficiencyLevel;
  level: string;
  code: string;
  name: string;
  description: string;
  keyActions: string;
};
