import { Entity,Column , JoinColumn, ManyToOne } from "typeorm";
import { ExternalApplicants } from "../../../../../../data/entities/external-applicants.entity";
import { PDSEducation } from "../../../data/entities/pds-education.entity";

@Entity({name: 'pds_education_college'})
export class PDSEducationCollege extends PDSEducation{
    @ManyToOne(()=>ExternalApplicants,externalApplicants=>externalApplicants._id)
    @JoinColumn({name: 'external_applicant_id_fk'})
    externalApplicantId: ExternalApplicants;

    @Column()
    degree: string;

    @Column()
    units: string;
}