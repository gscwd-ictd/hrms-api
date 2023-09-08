import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ExternalApplicants } from '../../../../../../../data/entities/external-applicants.entity';

@Entity({ name: 'pds_separated_service' })
export class PDSSeparatedService extends DefaultTable {
  @Column({ name: 'is_separated', type: 'boolean' })
  isSeparated: boolean;

  @Column()
  details: string;

  @OneToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
