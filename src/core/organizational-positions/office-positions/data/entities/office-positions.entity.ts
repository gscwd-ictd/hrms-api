import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Office } from 'src/core/organization/office/data/entities/office.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'office_positions' })
export class OfficePositions extends DefaultTable {
  @JoinColumn({ name: 'position_id_fk' })
  @ManyToOne(() => PlantillaPositions, (positions) => positions._id, { onUpdate: 'CASCADE' })
  positionId: PlantillaPositions;

  @JoinColumn({ name: 'office_id_fk' })
  @ManyToOne(() => Office, (office) => office._id, { onUpdate: 'CASCADE' })
  officeId: Office;

  @Column({ type: 'text' })
  summary: string;
}
