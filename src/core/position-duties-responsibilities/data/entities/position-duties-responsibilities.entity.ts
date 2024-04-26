import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { DutyType } from 'src/core/occupational-group-duties-responsibilities/utils/enums/duty-type.enum';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { PositionCompetencyProficiencyLevel } from 'src/core/position-competency-proficiency-level/data/entities/position-competency-proficiency-level.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'position_duties_responsibilities' })
export class PositionDutiesResponsibilities extends DefaultTable {
  @ManyToOne(() => PlantillaPositions, (plantillaPositions) => plantillaPositions._id)
  @JoinColumn({ name: 'plantilla_positions_id_fk' })
  plantillaPositionId: PlantillaPositions;

  @ManyToOne(() => PositionCompetencyProficiencyLevel, (positionCompetencyProficiencyLevel) => positionCompetencyProficiencyLevel._id)
  @JoinColumn({ name: 'position_competency_proficiency_level_id_fk' })
  pcplId: PositionCompetencyProficiencyLevel;

  @Column({ name: 'duty', type: 'text', nullable: false })
  duty: string;

  @Column({ name: 'percentage', type: 'decimal', nullable: false })
  percentage: number;

  @Column({ name: 'duty_type', type: 'enum', enum: DutyType, nullable: false })
  dutyType: DutyType;
}
