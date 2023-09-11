import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Occupation } from 'src/core/occupation/data/entities/occupation.entity';
import { OccupationalGroupDutiesResponsibilities } from 'src/core/occupational-group-duties-responsibilities/data/entities/occupational-group-duties-responsibilities.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'occupational_group' })
export class OccupationalGroup extends DefaultTable {
  @ManyToOne(() => Occupation, (occupation) => occupation._id, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'occupation_id_fk' })
  occupationId: Occupation;

  @ManyToOne(() => PlantillaPositions, (position) => position._id, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'position_id_fk' })
  positionId: PlantillaPositions;

  @OneToMany(() => OccupationalGroupDutiesResponsibilities, (ogdr) => ogdr.occupationalGroupId)
  ogdr: OccupationalGroupDutiesResponsibilities[];
}
