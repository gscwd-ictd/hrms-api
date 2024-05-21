import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { DutiesResponsibilities } from 'src/core/duties-responsibilities/data/entities/duties-resposibilities.entity';
import { OccupationsDutiesResponsibilities } from '../entities/occupations-duties-responsibilities.entity';

export class OccupationDutiesResponsibilitiesDTO {
  @IsNotEmpty()
  dutyResponsibilityIds: DutiesResponsibilities[];
}

export class OccupationDutiesResponsibilitiesDeleteDTO {
  odrIds: OccupationsDutiesResponsibilities[];
}

export class CreateOccupationDutiesResponsibilitiesDto {
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class DeleteOccupationDutiesResponsibilitiesDto {
  @IsNotEmpty()
  @IsUUID()
  odrId: string;

  @IsNotEmpty()
  @IsUUID()
  drId: string;
}
