import { IsNotEmpty, IsString } from 'class-validator';
import { OrganizationalEntitiesDto } from 'src/core/organization/data/dtos/organization.dto';
import { Office } from 'src/core/organization/office/data/entities/office.entity';

export class DepartmentDto extends OrganizationalEntitiesDto {
  @IsNotEmpty()
  @IsString()
  officeId: Office;
}
