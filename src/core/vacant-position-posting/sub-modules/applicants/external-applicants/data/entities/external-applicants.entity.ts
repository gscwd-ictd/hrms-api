import { Column, Entity } from 'typeorm';
import { DefaultTable } from '../../../../../../base-entity/data/base.entity';

@Entity()
export class ExternalApplicants extends DefaultTable {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name' })
  middleName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'name_extension' })
  nameExtension: string;

  @Column()
  email: string;
}
