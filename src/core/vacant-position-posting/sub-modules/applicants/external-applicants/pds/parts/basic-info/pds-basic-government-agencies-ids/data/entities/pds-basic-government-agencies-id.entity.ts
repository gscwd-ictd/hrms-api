import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { ExternalApplicants } from "../../../../../../data/entities/external-applicants.entity";

@Entity({name: 'pds_basic_government_agencies_ids'})
export class PDSBasicGovernmentAgenciesIds extends DefaultTable{
    @Column({name: 'gsis_number'})
    gsisNumber: string;

    @Column({name: 'pagibig_number'})
    pagibigNumber: string;

    @Column({name: 'philhealth_number'})
    philhealthNumber: string;

    @Column({name: 'sss_number'})
    sssNumber: string;

    @Column({name: 'tin_number'})
    tinNumber: string;

    @Column({name: 'agency_number'})
    agencyNumber: string;
    
    @ManyToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;
}