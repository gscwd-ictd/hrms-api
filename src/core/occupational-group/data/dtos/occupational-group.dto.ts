import { Occupation } from 'src/core/occupation/data/entities/occupation.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';

export class OccupationalGroupDto {
  occupationId: Occupation;
  positionId: PlantillaPositions;
}

export type OccupationalGroupDtoForMultiplePositions = {
  positionIds: [];
};
