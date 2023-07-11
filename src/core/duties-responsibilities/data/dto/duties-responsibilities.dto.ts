import { IsNotEmpty, IsString } from 'class-validator';

export class DutiesResponsibilitiesDTO {
  @IsString()
  @IsNotEmpty()
  description: string;
}
