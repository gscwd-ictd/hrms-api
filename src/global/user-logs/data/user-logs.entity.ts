import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_logs')
export class UserLogs extends DefaultTable {
  @Column({ name: 'user_id_fk' })
  userId: string;

  @Column()
  route: string;

  @Column()
  method: string;

  @Column({ type: 'text', default: null })
  body: string;
}
