import { OccupationalGroupDutiesResponsibilitiesType } from '../../utils/occupational-group-duties-responsibilities.types';

export class OgdrDto {
  core?: OccupationalGroupDutiesResponsibilitiesType[];
  support?: OccupationalGroupDutiesResponsibilitiesType[];
  deleted?: string[];
}

export class UpdateOgdrDto {
  add: {
    core: OccupationalGroupDutiesResponsibilitiesType[];
    support: OccupationalGroupDutiesResponsibilitiesType[];
  };
  update: {
    core: OccupationalGroupDutiesResponsibilitiesType[];
    support: OccupationalGroupDutiesResponsibilitiesType[];
    deleted: string[];
  };
}

export class OgdrDeleteDto {
  core?: string[];
  support?: string[];
}
