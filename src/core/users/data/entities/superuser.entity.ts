import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'super_user' })
export class SuperUser extends DefaultTable {
  @Column()
  username: string;

  @Column()
  password: string;
}
