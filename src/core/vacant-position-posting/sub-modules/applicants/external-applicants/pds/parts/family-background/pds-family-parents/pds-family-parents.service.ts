import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityCrudService } from "src/core/base-entity/base-entity.service";
import { Repository } from "typeorm";
import { PDSFamilyParentsDTO } from "./data/dto/pds-family-parents.dto";
import { PDSFamilyParents } from "./data/entities/pds-family-parents.entity";

@Injectable()
export class PDSFamilyParentsService extends BaseEntityCrudService<PDSFamilyParents>{
    constructor(@InjectRepository(PDSFamilyParents) pdsFamilyParentsRepository: Repository<PDSFamilyParents>){
        super(pdsFamilyParentsRepository);
    }
}