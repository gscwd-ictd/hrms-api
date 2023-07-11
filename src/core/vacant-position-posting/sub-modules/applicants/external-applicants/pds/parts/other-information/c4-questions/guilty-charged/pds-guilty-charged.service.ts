import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityCrudService } from "src/core/base-entity/base-entity.service";
import { Repository } from "typeorm";
import { PDSGuiltyCharged } from "./data/entities/pds-guilty-charged.entity";

@Injectable()
export class PDSGuiltyChargedService extends BaseEntityCrudService<PDSGuiltyCharged>{
    constructor(@InjectRepository(PDSGuiltyCharged) pdsGuiltyChargedRepository : Repository<PDSGuiltyCharged>){
        super(pdsGuiltyChargedRepository);
    }
}