import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { WorkExperienceSheetBasic } from '../../basic/data/basic.entity';

@Entity('pds_work_experience_sheet_duties')
export class WorkExperienceSheetDuties extends DefaultTable {
  @PrimaryGeneratedColumn('uuid', { name: '_id' })
  _id: string;

  @ManyToOne(() => WorkExperienceSheetBasic, (workExperienceSheetBasic) => workExperienceSheetBasic._id)
  @JoinColumn({ name: 'work_experience_sheet_basic_id_fk' })
  workExperienceSheetBasicId: WorkExperienceSheetBasic;

  @Column({ type: 'text' })
  duty: string;
}
