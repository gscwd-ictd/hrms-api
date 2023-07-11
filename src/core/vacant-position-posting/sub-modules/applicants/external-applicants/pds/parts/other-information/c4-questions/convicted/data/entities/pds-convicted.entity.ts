import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { ExternalApplicants } from "src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";


@Entity({name:'pds_convicted'})
export class PDSConvicted extends DefaultTable{
    @Column({name: 'is_convicted', type: 'boolean'})
    isConvicted: boolean;

    @Column()
    details: string;
    
    @OneToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;



}