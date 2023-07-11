import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { PDSEducationDTO, PDSSchoolsAttended } from "../data/dtos/pds-education.dto";
import { PDSEducationGraduateService } from "./pds-education-graduate.service";

@Controller('pds/education/graduate')
export class PDSEducationGraduateController{
    constructor(private pdsEducationGraduateService: PDSEducationGraduateService){}

    @Post(':applicant_id')
    async addCollege(@Param('applicant_id') applicantId: string, @Body() pdsSchoolsAttended : PDSSchoolsAttended){
       return await this.pdsEducationGraduateService.addGraduate(applicantId, pdsSchoolsAttended);
    }

    @Put(':_id')
    async updateCollege(@Param('_id') _id : string, @Body() pdsEducationDTO : PDSEducationDTO){
        return await this.pdsEducationGraduateService.updateEntity({_id, ...pdsEducationDTO});
    }

    @Delete(':_id')
    async deleteCollege(@Param('_id') _id: string){
        return await this.pdsEducationGraduateService.removeEntity('_id');
    }


}