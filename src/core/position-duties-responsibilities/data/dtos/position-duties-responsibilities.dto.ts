import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDecimal, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';

export class DutiesReponsibilitiesDto {
  @IsNotEmpty()
  @IsUUID()
  proficiencyId: string;

  @IsNotEmpty()
  @IsString()
  duty: string;

  @IsNotEmpty()
  @IsDecimal()
  percentage: number;
}

export class PositionDutiesResponsibilitiesDto {
  @IsNotEmpty()
  @IsUUID()
  plantillaPositionId: string;

  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DutiesReponsibilitiesDto)
  core: Array<DutiesReponsibilitiesDto>;

  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DutiesReponsibilitiesDto)
  support: Array<DutiesReponsibilitiesDto>;
}
