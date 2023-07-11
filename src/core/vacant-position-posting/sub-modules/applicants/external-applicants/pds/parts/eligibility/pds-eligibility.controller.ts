import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { PDSEligibilityDTO } from "./data/dtos/pds-eligibility.dto";
import { PDSEligibilityService } from "./pds-eligibility.service";

@Controller('pds/eligibility')
export class PDSEligibilityController{
    constructor(private pdsEligibilityService: PDSEligibilityService){}

    @Post(':applicant_id')
    async addEligibility(@Param('applicant_id') externalApplicantId: string, 
    @Body() pdsEligibilityDTO: PDSEligibilityDTO[]){
        return await this.pdsEligibilityService.addEligibility(externalApplicantId,pdsEligibilityDTO);
    }

    @Put(':_id')
    async updateEligibility(@Param('_id') _id : string, @Body() pdsEligibilityDTO: PDSEligibilityDTO){
        return await this.pdsEligibilityService.updateEntity({_id, ...pdsEligibilityDTO});
    }

    @Delete(':_id')
    async deleteEligibility(@Param('_id') _id: string){
        return await this.pdsEligibilityService.removeEntity(_id);
    }
}