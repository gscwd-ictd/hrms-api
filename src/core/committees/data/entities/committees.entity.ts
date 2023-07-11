import { DefaultTable } from '../../../base-entity/data/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CommitteeMembers } from 'src/core/committee-members/data/entities/committee-members.entity';

@Entity({ name: 'committees' })
export class Committees extends DefaultTable {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @OneToMany(() => CommitteeMembers, (committeeMembers) => committeeMembers.committeeId)
  committeeMembers: CommitteeMembers[];
}
