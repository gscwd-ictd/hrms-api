import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ExternalApplicants } from '../../../../../../data/entities/external-applicants.entity';
import { Sex, CivilStatus, BloodType, Citizenship, DualCitizenshipType } from '../../../../../utils/enums/pds.enum';

@Entity({ name: 'pds_basic_personal_info' })
export class PDSBasicPersonalInfo extends DefaultTable {
  @Column({ name: 'birth_date' })
  birthDate: Date;

  @Column({ name: 'birth_place' })
  birthPlace: string;

  @Column({ name: 'sex', type: 'enum', enum: Sex })
  sex: Sex;

  @Column({ name: 'civil_status', type: 'enum', enum: CivilStatus })
  civilStatus: CivilStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ name: 'blood_type', type: 'enum', enum: BloodType })
  bloodType: BloodType;

  @Column({ name: 'mobile_number' })
  mobileNumber: string;

  @Column({ name: 'telephone_number' })
  telephoneNumber: string;

  @Column({ type: 'enum', enum: Citizenship })
  citizenship: Citizenship;

  @Column({ type: 'enum', enum: DualCitizenshipType, nullable: true })
  citizenshipType: DualCitizenshipType;

  @Column({ name: 'country' })
  country: string;

  @ManyToOne(() => ExternalApplicants, (externalApplicants) => externalApplicants._id)
  @JoinColumn({ name: 'external_applicant_id_fk' })
  externalApplicantId: ExternalApplicants;
}
