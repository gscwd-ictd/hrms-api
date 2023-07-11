import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityCrudService } from "src/core/base-entity/base-entity.service";
import { Repository } from "typeorm";
import { PDSBasicResidentialAddress } from "./data/entities/pds-basic-residential-address.entity";

@Injectable()
export class PDSBasicResidentialAddressService extends BaseEntityCrudService<PDSBasicResidentialAddress>{
    constructor(@InjectRepository(PDSBasicResidentialAddress) pdsBasicResidentialAddressRepository: Repository<PDSBasicResidentialAddress>)
    {
        super(pdsBasicResidentialAddressRepository);
    }
    
}