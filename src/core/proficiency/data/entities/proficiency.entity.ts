import { CompetencyModel } from 'src/core/competency-model/data/entities/competency-model.entity';
import { PositionCompetencyProficiencyLevel } from 'src/core/position-competency-proficiency-level/data/entities/position-competency-proficiency-level.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DefaultTable } from '../../../base-entity/data/base.entity';
import { ProficiencyLevel } from '../../utils/enum/proficiency.enum';

@Entity({ name: 'proficiency' })
export class Proficiency extends DefaultTable {
  @ManyToOne(() => CompetencyModel, (competencymodel) => competencymodel._id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competency_id_fk' })
  competencyId: CompetencyModel;

  @Column({
    name: 'level',
    type: 'enum',
    enum: ProficiencyLevel,
    nullable: false,
  })
  level: ProficiencyLevel;

  @Column({ type: 'text', nullable: true, name: 'key_actions' })
  keyActions: string;

  @OneToMany(() => PositionCompetencyProficiencyLevel, (pcpl) => pcpl.profId)
  pcpl: PositionCompetencyProficiencyLevel[];
}
