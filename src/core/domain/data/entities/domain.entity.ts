
import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { CompetencyModel } from 'src/core/competency-model/data/entities/competency-model.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'domain' })
export class Domain extends DefaultTable {
  @Column()
  type: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => CompetencyModel, (competencymodel) => competencymodel.domainId)
  competencymodel: CompetencyModel[];
}
