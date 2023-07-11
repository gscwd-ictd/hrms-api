import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { ExternalApplicants } from "../../../../../../data/entities/external-applicants.entity";

@Entity({name: 'pds_family_spouse'})
export class PDSFamilySpouse extends DefaultTable{

    @Column({name: 'first_name', nullable: true})
    firstName: string;

    @Column({name: 'middle_name', nullable: true})
    middleName: string;

    @Column({name: 'last_name',nullable: true})
    lastName: string;

    @Column({name: 'name_extension'})
    nameExtension: string;

    @Column()
    occupation: string;

    @Column()
    employer: string;

    @Column({name: 'business_address'})
    businessAddress: string;

    @Column({name: 'telephone_number'})
    telephoneNumber: string;

    @OneToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;
}

