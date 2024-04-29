import { CompetencyModel } from 'src/core/competency-model/data/entities/competency-model.entity';
import { ProficiencyLevel } from '../../utils/enum/proficiency.enum';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ProficiencyDto {
  competencyId: CompetencyModel;

  @IsNotEmpty()
  @IsEnum(ProficiencyLevel)
  level: ProficiencyLevel;

  @IsNotEmpty()
  @IsString()
  keyActions: string;
}

export class UpdateProficiencyDto {
  @IsNotEmpty()
  @IsUUID()
  _id: string;

  @IsNotEmpty()
  @IsString()
  keyActions: string;
}
