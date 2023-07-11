import { DefaultTable } from "src/core/base-entity/data/base.entity";
import { Occupation } from "src/core/occupation/data/entities/occupation.entity";
import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { CompetencyModel } from "../../../competency-model/data/entities/competency-model.entity";


@Entity()
export class CompetencyModelOccupation extends DefaultTable{
    
    @ManyToOne(()=>Occupation,(occupation)=>occupation._id)
    @JoinColumn({name: 'occupation_id_fk'})
    occupationId: Occupation;

    @ManyToOne(()=>CompetencyModel, (competencyModel)=>competencyModel._id)
    @JoinColumn({name: 'competency_model_id_fk'})
    competencyModelId: CompetencyModel;

}