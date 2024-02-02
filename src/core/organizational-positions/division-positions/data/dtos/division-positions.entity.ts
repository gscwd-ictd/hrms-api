import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Divisions } from 'src/core/organization/division/data/entities/divisions.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'division_positions' })
export class DivisionPositions extends DefaultTable {
  @JoinColumn({ name: 'position_id_fk' })
  @ManyToOne(() => PlantillaPositions, (position) => position._id, { onUpdate: 'CASCADE' })
  positionId: PlantillaPositions;

  @JoinColumn({ name: 'division_id_fk' })
  @ManyToOne(() => Divisions, (div) => div._id, { onUpdate: 'CASCADE' })
  divisionId: Divisions;

  @Column({ type: 'text', nullable: true, default: null })
  summary: string;
}
