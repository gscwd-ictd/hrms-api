import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { OccupationalGroup } from 'src/core/occupational-group/data/entities/occupational-group.entity';
import { Proficiency } from 'src/core/proficiency/data/entities/proficiency.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PositionCompetencyProficiencyLevel extends DefaultTable {
  @ManyToOne(() => OccupationalGroup, (occupationalgroup) => occupationalgroup._id, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'occupational_group_id_fk' })
  occupationalGroupId: OccupationalGroup;

  @ManyToOne(() => Proficiency, (proficiency) => proficiency._id, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'proficiency_id_fk' })
  profId: Proficiency;
}
