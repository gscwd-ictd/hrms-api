import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PostingStatus } from '../../utils/enums/posting-status.enum';

@Entity({ name: 'vacant_position_posting' })
export class VacantPositionPosting extends DefaultTable {
  @Column({ name: 'posting_date', type: 'date' })
  postingDate: Date;

  @Column({ name: 'posting_deadline', type: 'date', nullable: true })
  postingDeadline: Date;

  @Column({ name: 'posting_status', type: 'enum', enum: PostingStatus, default: PostingStatus.FOR_PRINTING })
  postingStatus: PostingStatus;

  @Column({ name: 'effectivity_date', type: 'date', nullable: true })
  effectivityDate: Date;
}
