import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'duties_responsibilities' })
export class DutiesResponsibilities extends DefaultTable {
  @Column({ type: 'text' })
  description: string;
}
