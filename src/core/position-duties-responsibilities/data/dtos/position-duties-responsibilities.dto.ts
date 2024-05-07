import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';

export class DutiesReponsibilitiesDto {
  @IsNotEmpty()
  @IsUUID()
  pcplId: string;

  @IsNotEmpty()
  @IsString()
  duty: string;

  @IsNotEmpty()
  @IsInt()
  percentage: number;
}

export class CreatePositionDutiesResponsibilitiesDto {
  @IsNotEmpty()
  @IsUUID()
  positionId: string;

  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DutiesReponsibilitiesDto)
  core: Array<DutiesReponsibilitiesDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DutiesReponsibilitiesDto)
  support: Array<DutiesReponsibilitiesDto>;
}

export class PositionDutiesResponsibilitiesDto {
  @IsNotEmpty()
  @IsUUID()
  pdrId: string;
}

export class UpdatePositionDutiesResponsibilitiesDto extends PartialType(CreatePositionDutiesResponsibilitiesDto) {
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDutiesResponsibilitiesDto)
  positionDuties: Array<PositionDutiesResponsibilitiesDto>;
}
