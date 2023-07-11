import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityCrudService } from "src/core/base-entity/base-entity.service";
import { Repository } from "typeorm";
import { PDSGovernmentIssuedId } from "./data/entities/pds-government-issued-id.entity";

@Injectable()
export class PDSGovernmentIssuedIdService extends BaseEntityCrudService<PDSGovernmentIssuedId>{
    constructor(@InjectRepository(PDSGovernmentIssuedId) pdsGovernmentIssuedIdRepository: Repository<PDSGovernmentIssuedId>){
        super(pdsGovernmentIssuedIdRepository);
    }
}