import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityCrudService } from "src/core/base-entity/base-entity.service";
import { Repository } from "typeorm";
import { PDSCandidateResigned } from "./data/entities/pds-candidate-resigned.entity";

@Injectable()
export class PDSCandidateResignedService extends BaseEntityCrudService<PDSCandidateResigned>{
    constructor(@InjectRepository(PDSCandidateResigned) pdsCandidateResignedRepository: Repository<PDSCandidateResigned>){
        super(pdsCandidateResignedRepository);
    }
}