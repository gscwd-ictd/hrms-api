import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { DefaultTable } from '../../../../../../../../../../../base-entity/data/base.entity';
import { ExternalApplicants } from '../../../../../../../data/entities/external-applicants.entity';

@Entity({ name: 'pds_office_relation' })
export class PDSOfficeRelation extends DefaultTable {
  @Column({ name: 'within_third_degree', type: 'boolean' })
  withinThirdDegree: boolean;

  @Column({ name: 'within_fourth_degree', type: 'boolean' })
  withinFourthDegree: boolean;

  @Column()
  details: string;

  @OneToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
