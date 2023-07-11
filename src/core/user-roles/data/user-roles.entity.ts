import { Modules } from './../hrms-modules/data/modules.entity';
import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Users } from 'src/core/users/data/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, Unique } from 'typeorm';

@Unique('user_roles_unique_id', ['userId', 'moduleId'])
@Entity('user_roles')
export class UserRoles extends DefaultTable {
  @ManyToOne(() => Users, (users) => users._id)
  @JoinColumn({ name: 'user_id_fk' })
  userId: Users;

  @ManyToOne(() => Modules, (module) => module._id)
  @JoinColumn({ name: 'module_id_fk' })
  moduleId: Modules;

  @Column({ name: 'has_access', type: 'boolean' })
  hasAccess: boolean;
}
