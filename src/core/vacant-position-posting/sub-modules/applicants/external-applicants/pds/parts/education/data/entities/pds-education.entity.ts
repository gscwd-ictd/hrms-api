import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column } from 'typeorm';

export abstract class PDSEducation extends DefaultTable {
  @Column({ name: 'school_name' })
  schoolName: string;

  @Column({ type: 'year' })
  from: number;

  @Column({ type: 'year', nullable: true })
  to: number;

  @Column({ type: 'year', name: 'year_graduated', nullable: true })
  yearGraduated: number;

  @Column()
  awards: string;
}
