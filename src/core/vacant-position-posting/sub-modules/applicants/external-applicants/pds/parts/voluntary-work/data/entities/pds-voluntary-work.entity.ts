import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExternalApplicants } from '../../../../../data/entities/external-applicants.entity';

@Entity({ name: 'pds_voluntary_work' })
export class PDSVoluntaryWork extends DefaultTable {
  @Column({ name: 'organization_name' })
  organizationName: string;

  @Column({ name: 'position' })
  position: string;

  @Column()
  from: Date;

  @Column({ nullable: true })
  to: Date;

  @Column({ name: 'number_of_hours', nullable: true })
  numberOfHours: number;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
