import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { ExternalApplicants } from "src/core/vacant-position-posting/sub-modules/applicants/external-applicants/data/entities/external-applicants.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

@Entity({name: 'pds_indigenous_pwd_soloparent'})
export class PDSIndigenousPWDSoloParent extends DefaultTable{
    
    @Column({name: 'is_indigenous_member', type: 'boolean'})
    isIndigenousMember: boolean;

    @Column({name: 'indigenous_member_details'})
    indigenousMemberDetails: string;

    @Column({name:'is_pwd', type: 'boolean'})
    isPwd: boolean;

    @Column({name: 'pwd_id_number'})
    pwdIdNumber: string;

    @Column({name:'is_soloparent', type:'boolean'})
    isSoloParent: boolean;

    @Column({name: 'soloparent_id_number'})
    soloParentIdNumber: string;

    @OneToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;
}