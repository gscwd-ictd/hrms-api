import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { ExternalApplicants } from "src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";


@Entity({name: 'pds_guilty_charged'})
export class PDSGuiltyCharged extends DefaultTable{
    @Column({name: 'is_guilty', type: 'boolean'})
    isGuilty: boolean;

    @Column({name: 'guilty_details'})
    guiltyDetails: string;

    @Column({name: 'is_charged', type:'boolean'})
    isCharged: boolean;

    @Column({name: 'charged_date_filed', nullable: true})
    chargedDateFiled: Date;

    @Column({name:'charged_case_status'})
    chargedCaseStatus: string;

    @OneToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;
}