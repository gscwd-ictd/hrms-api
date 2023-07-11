import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DutiesResponsibilities } from 'src/core/duties-responsibilities/data/entities/duties-resposibilities.entity';
import { OccupationsDutiesResponsibilities } from '../entities/occupations-duties-responsibilities.entity';

export class OccupationDutiesResponsibilitiesDTO {
  @IsNotEmpty()
  dutyResponsibilityIds: DutiesResponsibilities[];
}

export class OccupationDutiesResponsibilitiesDeleteDTO {
  odrIds: OccupationsDutiesResponsibilities[];
}
