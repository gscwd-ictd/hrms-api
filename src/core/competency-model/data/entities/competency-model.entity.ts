import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Domain } from 'src/core/domain/data/entities/domain.entity';
import { Proficiency } from 'src/core/proficiency/data/entities/proficiency.entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity({ name: 'competency_model' })
export class CompetencyModel extends DefaultTable {
  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', name: 'desc' })
  definition: string;

  @ManyToOne(() => Domain, (e) => e._id, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'domain_id_fk' })
  domainId: Domain;

  @OneToMany(() => Proficiency, (proficiency) => proficiency.competencyId)
  proficiency: Proficiency[];
}
