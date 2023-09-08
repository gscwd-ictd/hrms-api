import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'qualification_standards' })
export class QualificationStandards extends DefaultTable {
  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  training: string;

  @Column({ nullable: true })
  eligibility: string;

  @Column({ nullable: true })
  experience: string;

  @JoinColumn({ name: 'position_id_fk' })
  @ManyToOne(() => PlantillaPositions, (pp) => pp._id, { onUpdate: 'CASCADE' })
  positionId: PlantillaPositions;
}
