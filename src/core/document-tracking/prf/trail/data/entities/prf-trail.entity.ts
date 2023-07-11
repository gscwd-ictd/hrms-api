import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { PrfDetails } from "src/core/prf-details/data/entity/prf-details.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { PrfTrailStatus } from "../../utils/enums/prf-trail-status.enum";

@Entity('prf_trail')
export class PrfTrail extends DefaultTable{
    @ManyToOne(()=>PrfDetails, prfDetails=>prfDetails._id)
    @JoinColumn({name: 'prf_details_id_fk'})
    prfDetailsId: PrfDetails;

    @Column({name: 'division_status', type: 'enum', enum: PrfTrailStatus,nullable: true})
    divisionStatus : PrfTrailStatus;

    @Column({name:'division_status_updated_at', nullable: true})
    divisionStatusUpdatedAt: Date;

    @Column({name: 'department_status', type: 'enum', enum: PrfTrailStatus,nullable: true})
    departmentStatus : PrfTrailStatus;

    @Column({name:'department_status_updated_at', nullable:true })
    departmentStatusUpdatedAt: Date;

    @Column({name: 'agm_status', type: 'enum', enum: PrfTrailStatus,nullable: true})
    agmStatus : PrfTrailStatus;

    @Column({name: 'agm_status_updated_at', nullable: true})
    agmStatusUpdatedAt: Date;

    @Column({name: 'admin_status', type: 'enum', enum: PrfTrailStatus,nullable: true})
    adminStatus : PrfTrailStatus;

    @Column({name: 'admin_status_updated_at', nullable: true})
    adminStatusUpdatedAt: Date;

    @Column({name: 'gm_status', type: 'enum', enum: PrfTrailStatus,nullable: true})
    gmStatus : PrfTrailStatus;

    @Column({name: 'gm_status_updated_at', nullable: true})
    gmStatusUpdatedAt: Date;

    @Column({name: 'board_status', type: 'enum', enum: PrfTrailStatus,nullable: true})
    boardStatus : PrfTrailStatus;

    @Column({ nullable: true,default: null })
    remarks: string;
}