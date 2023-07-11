import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'pds_family_parents' })
export class PDSFamilyParents extends DefaultTable {
  @Column({ name: 'father_first_name' })
  fatherFirstName: string;

  @Column({ name: 'father_middle_name' })
  fatherMiddleName: string;

  @Column({ name: 'father_last_name' })
  fatherLastName: string;

  @Column({ name: 'father_name_extension' })
  fatherNameExtension: string;

  @Column({ name: 'mother_first_name' })
  motherFirstName: string;

  @Column({ name: 'mother_middle_name', nullable: true })
  motherMiddleName: string;

  @Column({ name: 'mother_last_name' })
  motherLastName: string;

  @Column({ name: 'mother_maiden_name', nullable: true })
  motherMaidenName: string;

  @OneToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
