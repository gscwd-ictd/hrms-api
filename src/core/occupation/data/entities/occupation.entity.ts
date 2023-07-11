import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { OccupationalGroup } from "src/core/occupational-group/data/entities/occupational-group.entity";
import { OccupationsDutiesResponsibilities } from "src/core/occupations-duties-responsibilities/data/entities/occupations-duties-responsibilities.entity";
import { Entity, Column, OneToMany } from "typeorm";

@Entity('occupations')
export class Occupation extends DefaultTable {
  @Column({ name: 'occupation_name' })
  occupationName: string;

  @OneToMany(() => OccupationalGroup, (occupationalgroup) => occupationalgroup.occupationId)
  occupationalgroup: OccupationalGroup[];

  @OneToMany(() => OccupationsDutiesResponsibilities, (odr) => odr.occupationId)
  occupationsDutiesResponsibilities: OccupationsDutiesResponsibilities[];
}
