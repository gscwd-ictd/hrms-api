import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { OccupationalGroup } from 'src/core/occupational-group/data/entities/occupational-group.entity';
import { OccupationsDutiesResponsibilities } from 'src/core/occupations-duties-responsibilities/data/entities/occupations-duties-responsibilities.entity';
import { PositionCompetencyProficiencyLevel } from 'src/core/position-competency-proficiency-level/data/entities/position-competency-proficiency-level.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DutyType } from '../../utils/enums/duty-type.enum';

@Entity({ name: 'occupational_group_duties_responsibilities' })
export class OccupationalGroupDutiesResponsibilities extends DefaultTable {
  @ManyToOne(() => OccupationalGroup, (og) => og._id, { onUpdate: 'CASCADE', eager: true })
  @JoinColumn({ name: 'occupational_group_id_fk' })
  occupationalGroupId: OccupationalGroup;

  @JoinColumn({ name: 'odr_id_fk' })
  @ManyToOne(() => OccupationsDutiesResponsibilities, (odr) => odr._id, { onUpdate: 'CASCADE', eager: true })
  odrId: OccupationsDutiesResponsibilities;

  @Column({ type: 'decimal', scale: 2, precision: 5, name: 'percentage' })
  percentage: number;

  @Column({ type: 'enum', enum: DutyType, name: 'duty_type' })
  dutyType: DutyType;

  @JoinColumn({ name: 'pcpl_id_fk' })
  @ManyToOne(() => PositionCompetencyProficiencyLevel, (pcpl) => pcpl._id)
  pcplId: PositionCompetencyProficiencyLevel;
}
