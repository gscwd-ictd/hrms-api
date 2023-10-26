import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Unique('modules_key', ['module'])
@Entity('modules')
export class Modules extends DefaultTable {
  @Column()
  module: string;

  @Column()
  slug: string;

  @Column()
  url: string;

  @Column()
  app: string;
}
