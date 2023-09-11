import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'pds_family_children' })
export class PDSFamilyChildren extends DefaultTable {
  @Column({ name: 'child_name' })
  childName: string;

  @Column({ name: 'birth_date' })
  birthDate: Date;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
