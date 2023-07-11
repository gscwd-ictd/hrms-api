
import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { ExternalApplicants } from "src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";


@Entity({name:'pds_candidate_resigned'})
export class PDSCandidateResigned extends DefaultTable{
    @Column({name: 'is_candidate',type:'boolean'})
    isCandidate: boolean;

    @Column()
    candidateDetails: string;

    @Column({name: 'is_resigned', type: 'boolean'})
    isResigned: boolean;

    @Column()
    resignedDetails: string;

    @OneToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;
}