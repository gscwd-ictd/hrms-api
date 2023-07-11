import { WorkExperienceSheetBasic } from './../../basic/data/basic.entity';
import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pds_work_experience_sheet_accomplishments')
export class WorkExperienceSheetAccomplishments extends DefaultTable {
  @PrimaryGeneratedColumn('uuid', { name: 'basic_id' })
  _id: string;

  @ManyToOne(() => WorkExperienceSheetBasic, (workExperienceSheetBasic) => workExperienceSheetBasic._id)
  @JoinColumn({ name: 'work_experience_sheet_basic_id_fk' })
  workExperienceSheetBasicId: WorkExperienceSheetBasic;

  @Column({ type: 'text' })
  accomplishment: string;
}
