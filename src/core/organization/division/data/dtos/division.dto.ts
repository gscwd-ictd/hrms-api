import { IsNotEmpty, IsString } from 'class-validator';
import { OrganizationalEntitiesDto } from 'src/core/organization/data/dtos/organization.dto';

export class DivisionDto extends OrganizationalEntitiesDto {
  @IsNotEmpty()
  @IsString()
  departmentId: string;
}
