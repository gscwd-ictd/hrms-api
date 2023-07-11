import { UserRole } from 'src/core/users/utils/enums/role.enum';
import { CommitteeMembers } from 'src/core/committee-members/data/entities/committee-members.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Users } from 'src/core/users/data/entities/users.entity';
import { PostingApplicants } from 'src/core/vacant-position-posting/sub-modules/applicants/data/entities/posting-applicants.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { DefaultTable } from '../../../base-entity/data/base.entity';

@Entity({ name: 'employees' })
export class Employees extends DefaultTable {
  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Column({ name: 'title_prefix', nullable: true })
  titlePrefix: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name' })
  middleName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'name_extension', nullable: true })
  nameExtension: string;

  @Column({ name: 'title_suffix', nullable: true })
  titleSuffix: string;

  @Column({ name: 'user_role', type: 'enum', enum: UserRole })
  userRole: UserRole;

  @Column({ nullable: true, name: 'signature_url' })
  signatureUrl: string;

  @OneToOne(() => PlantillaPositions, (plantillaPositions) => plantillaPositions.employeeId)
  plantillaPositions: PlantillaPositions;

  @OneToOne(() => Users, (users) => users.employeeId)
  users: Users;

  @OneToMany(() => PostingApplicants, (postingApplicants) => postingApplicants.employeeId)
  postingEmployeeApplicants: PostingApplicants[];

  @OneToMany(() => CommitteeMembers, (committeeMembers) => committeeMembers.employeeId)
  committeeMembers: CommitteeMembers[];
}
