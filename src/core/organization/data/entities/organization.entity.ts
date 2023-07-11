import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column } from 'typeorm';

export abstract class OrganizationalEntity extends DefaultTable {
  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'text' })
  description: string;
}
