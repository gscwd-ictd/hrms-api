import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { PDSWorkExperience } from '../../../../work-experience/data/entities/pds-workexperience.entity';

@Entity('pds_work_experience_sheet_basic')
export class WorkExperienceSheetBasic extends DefaultTable {
  @PrimaryGeneratedColumn('uuid', { name: 'basic_id' })
  _id: string;

  @ManyToOne(() => PDSWorkExperience, (workExperience) => workExperience._id, { eager: true })
  @JoinColumn({ name: 'pds_work_experience_id_fk' })
  workExperienceId: PDSWorkExperience;

  @ManyToOne(() => PostingApplicants, (postingApplicants) => postingApplicants._id)
  @JoinColumn({ name: 'posting_applicant_id_fk' })
  postingApplicantId: string;

  @Column({ name: 'supervisor' })
  immediateSupervisor: string;

  @Column({ name: 'office' })
  nameOfOffice: string;
}
