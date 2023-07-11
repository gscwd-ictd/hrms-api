import { OrganizationalEntity } from 'src/core/organization/data/entities/organization.entity';
import { Departments } from 'src/core/organization/department/data/entities/departments.entity';
import { OfficePositions } from 'src/core/organizational-positions/office-positions/data/entities/office-positions.entity';
import { Entity, OneToMany } from 'typeorm';

@Entity({ name: 'office' })
export class Office extends OrganizationalEntity {
  @OneToMany(() => Departments, (departments) => departments.officeId)
  department: Departments[];

  @OneToMany(() => OfficePositions, (officePositions) => officePositions.positionId)
  officePositions: OfficePositions[];
}
