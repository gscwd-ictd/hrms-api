import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { PrfPositions } from 'src/core/prf-details/prf-positions/data/entity/prf-positions.entity';
import { VacantPositionPosting } from 'src/core/vacant-position-posting/data/entities/vacant-position-posting.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

/**
 * RULES: inserted positions with same title, competency, orgstruct, occupation, prfno must be grouped in the same vppId;
 */
@Entity('vpp_positions')
export class VppPositions extends DefaultTable {
  @JoinColumn({ name: 'vacant_position_posting_id_fk' })
  @ManyToOne(() => VacantPositionPosting, (vpp) => vpp._id)
  vppId: VacantPositionPosting;

  @JoinColumn({ name: 'prf_positions_positions_id_fk' })
  @ManyToOne(() => PlantillaPositions, (pp) => pp._id)
  prfPositionsId: PlantillaPositions;
}
