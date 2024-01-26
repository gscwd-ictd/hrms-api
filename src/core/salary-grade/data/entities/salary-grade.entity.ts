import { LogEntity } from 'src/core/base-entity/data/base.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('salary_grade')
@Unique(['salaryGrade', 'stepIncrement', 'effectivityYear'])
export class SalaryGrade extends LogEntity {
  @PrimaryGeneratedColumn({ name: '_id' })
  _id: number;

  @Column({ name: 'salary_grade' })
  salaryGrade: number;

  @Column({ name: 'step_increment' })
  stepIncrement: number;

  @Column()
  amount: number;

  @Column({ name: 'effectivity_year', type: 'year', nullable: true, default: null })
  effectivityYear: Date;

  @OneToMany(() => PlantillaPositions, (pp) => pp.salaryGrade)
  salaryGradeId: SalaryGrade[];
}
