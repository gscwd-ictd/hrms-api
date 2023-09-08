import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExternalApplicants } from '../../../../../../../data/entities/external-applicants.entity';

@Entity({ name: 'pds_references' })
export class PDSReferences extends DefaultTable {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ name: 'telephone_number' })
  telephoneNumber: string;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
