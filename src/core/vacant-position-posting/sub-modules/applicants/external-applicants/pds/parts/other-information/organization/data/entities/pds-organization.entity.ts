import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { DefaultTable } from "../../../../../../../../../../base-entity/data/base.entity";
import { ExternalApplicants } from "../../../../../../data/entities/external-applicants.entity";

@Entity({name: 'pds_organization'})
export class PDSOrganization extends DefaultTable{
    @Column({name:'organization'})
    organization: string;

    @ManyToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;
}