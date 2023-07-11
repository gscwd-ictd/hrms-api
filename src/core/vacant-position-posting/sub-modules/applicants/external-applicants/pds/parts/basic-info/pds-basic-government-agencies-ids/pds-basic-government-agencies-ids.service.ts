import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityCrudService } from "src/core/base-entity/base-entity.service";
import { Repository } from "typeorm";
import { PDSBasicGovernmentAgenciesIdsDTO } from "./data/dtos/pds-basic-government-agencies-id.dto";
import { PDSBasicGovernmentAgenciesIds } from "./data/entities/pds-basic-government-agencies-id.entity";

@Injectable()
export class PDSBasicGovernmentAgenciesIdsService extends BaseEntityCrudService<PDSBasicGovernmentAgenciesIds>{
    constructor(
        @InjectRepository(PDSBasicGovernmentAgenciesIds) pdsBasicGovernmentAgenciesIdRepository: Repository<PDSBasicGovernmentAgenciesIds>
    ){
        super(pdsBasicGovernmentAgenciesIdRepository)
    }

    async updateGovernmentIds(applicantId: string, governmentAgenciesIdDTO: PDSBasicGovernmentAgenciesIdsDTO){
        if((await this.entityRepository.createQueryBuilder('gi').update()
        .set(governmentAgenciesIdDTO).where('external_applicant_id_fk = :applicantId', {applicantId}).execute()).affected>  0)
            return {applicantId, ...governmentAgenciesIdDTO}
        throw new HttpException('PDS record not found',404);
   }
}