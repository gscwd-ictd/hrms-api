import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { ExternalApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity';
import { Column, JoinColumn, ManyToOne } from 'typeorm';

export abstract class PDSBasicAddress extends DefaultTable {
  @Column({ name: 'house_number' })
  houseNumber: string;

  @Column({ name: 'street' })
  street: string;

  @Column({ name: 'subdivision' })
  subdivision: string;

  @Column()
  barangay: string;

  @Column()
  city: string;

  @Column()
  province: string;

  @Column({ name: 'zip_code' })
  zipCode: string;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: string;
}
