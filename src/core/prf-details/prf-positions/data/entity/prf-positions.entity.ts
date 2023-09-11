import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { PrfDetails } from 'src/core/prf-details/data/entity/prf-details.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('prf_positions')
export class PrfPositions extends DefaultTable {
  @ManyToOne(() => PlantillaPositions, (plantillaPositions) => plantillaPositions._id)
  @JoinColumn({ name: 'position_id_fk' })
  positionId: PlantillaPositions;

  @Column()
  remarks: string;

  @ManyToOne(() => PrfDetails, (prfDetails) => prfDetails._id)
  @JoinColumn({ name: 'prf_details_id_fk' })
  prfDetailsId: string;
}
