import { OccupationDutiesResponsibilitiesDTO } from 'src/core/occupations-duties-responsibilities/data/dtos/occupations-duties-responsibilities.dto';
import { OccupationsDutiesResponsibilities } from 'src/core/occupations-duties-responsibilities/data/entities/occupations-duties-responsibilities.entity';
import { PositionCompetencyProficiencyLevel } from 'src/core/position-competency-proficiency-level/data/entities/position-competency-proficiency-level.entity';
import { OccupationalGroupDutiesResponsibilities } from '../data/entities/occupational-group-duties-responsibilities.entity';

export type OccupationalGroupDutiesResponsibilitiesType = {
  percentage?: number;
  odrId?: OccupationsDutiesResponsibilities;
  ogdrId?: string;
  pcplId?: PositionCompetencyProficiencyLevel;
};
