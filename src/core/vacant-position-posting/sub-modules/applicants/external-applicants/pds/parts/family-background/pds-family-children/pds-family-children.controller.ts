import { Controller, Param, Post,Body, Put, Delete } from "@nestjs/common";
import { PDSFamilyChildrenDTO } from "./data/dto/pds-family-children.dto";
import { PDSFamilyChildrenService } from "./pds-family-children.service";

@Controller('pds/family-background/children')
export class PDSFamilyChildrenController{
    constructor(private pdsFamilyChildrenService: PDSFamilyChildrenService){}

    @Post('applicant_id')
    async addChildren(@Param('applicant_id') externalApplicantId: string, 
    @Body() pdsFamilyChildrenDTO: PDSFamilyChildrenDTO[]){
        return await this.pdsFamilyChildrenService.addChildren(externalApplicantId, pdsFamilyChildrenDTO);
    }

    @Put(':_id')
    async updateChild(@Param('_id') _id : string, @Body() pdsFamilyChildrenDTO:PDSFamilyChildrenDTO)
    {
        return await this.pdsFamilyChildrenService.updateEntity({_id, ...pdsFamilyChildrenDTO});
    }

    @Delete(':_id')
    async deleteChild(@Param('_id') _id : string){
        return await this.pdsFamilyChildrenService.removeEntity(_id);
    }
}