import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

// QS texts can be longer than 255 characters. The columns are TEXT in the database: keep them TEXT here, or the
// TypeORM synchronize on start-up recreates the columns (drop + add) and every qualification standard is lost.
@Entity({ name: 'qualification_standards' })
export class QualificationStandards extends DefaultTable {
  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ type: 'text', nullable: true })
  training: string;

  @Column({ type: 'text', nullable: true })
  eligibility: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @JoinColumn({ name: 'position_id_fk' })
  @ManyToOne(() => PlantillaPositions, (pp) => pp._id, { onUpdate: 'CASCADE' })
  positionId: PlantillaPositions;
}
