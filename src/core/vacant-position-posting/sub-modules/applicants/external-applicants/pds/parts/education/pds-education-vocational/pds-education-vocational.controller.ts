import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { PDSEducationDTO, PDSSchoolsAttended } from "../data/dtos/pds-education.dto";
import { PDSEducationVocationalService } from "./pds-education-vocational.service";

@Controller('pds/education/vocational')
export class PDSEducationVocationalController{
    constructor(private pdsEducationVocationalService: PDSEducationVocationalService){}

    @Post(':applicant_id')
    async addVocational(@Param('applicant_id') applicantId: string, @Body() pdsSchoolsAttended : PDSSchoolsAttended){
        return await this.pdsEducationVocationalService.addVocational(applicantId,pdsSchoolsAttended)
    }

    @Put(':_id')
    async updateVocational(@Param('_id') _id : string, @Body() pdsEducationDTO : PDSEducationDTO ){
        return await this.pdsEducationVocationalService.updateEntity({_id,...pdsEducationDTO});
    }

    @Delete(':_id')
    async deleteVocational(@Param('_id') _id : string){
        return await this.pdsEducationVocationalService.removeEntity(_id);
    }
}