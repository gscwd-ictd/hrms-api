import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExternalApplicants } from '../../../../../data/entities/external-applicants.entity';

@Entity({ name: 'pds_learning_development' })
export class PDSLearningDevelopment extends DefaultTable {
  @Column()
  title: string;

  @Column({ name: 'conducted_by' })
  conductedBy: string;

  @Column({ name: 'type' })
  type: string;

  @Column()
  from: Date;

  @Column({ nullable: true })
  to: Date;

  @Column({ name: 'number_of_hours' })
  numberOfHours: number;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
