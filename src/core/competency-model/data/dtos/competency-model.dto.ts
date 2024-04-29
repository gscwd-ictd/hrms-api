import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Domain } from 'src/core/domain/data/entities/domain.entity';
import { ProficiencyDto, UpdateProficiencyDto } from 'src/core/proficiency/data/dtos/proficiency.dto';

export class CompetencyDto {
  @IsNotEmpty()
  @IsUUID()
  domainId: Domain;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  definition: string;

  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProficiencyDto)
  proficiencyKeyActions: ProficiencyDto[];
}

export class UpdateCompetencyDto {
  @IsNotEmpty()
  @IsUUID()
  competencyId: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  definition: string;

  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProficiencyDto)
  proficiencyKeyActions: UpdateProficiencyDto[];
}
