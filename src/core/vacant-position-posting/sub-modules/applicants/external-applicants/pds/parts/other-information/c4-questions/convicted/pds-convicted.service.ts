import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityCrudService } from "src/core/base-entity/base-entity.service";
import { Repository } from "typeorm";
import { PDSConvicted } from "./data/entities/pds-convicted.entity";

@Injectable()
export class PDSConvictedService extends BaseEntityCrudService<PDSConvicted>{
    constructor(@InjectRepository(PDSConvicted) pdsConvictedRepository : Repository<PDSConvicted>){
        super(pdsConvictedRepository);
    }
}