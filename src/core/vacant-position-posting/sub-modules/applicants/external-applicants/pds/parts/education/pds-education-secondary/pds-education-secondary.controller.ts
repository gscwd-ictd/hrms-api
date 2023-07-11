import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { PDSEducationDTO } from "../data/dtos/pds-education.dto";
import { PDSEducationSecondaryService } from "./pds-education-secondary.service";

@Controller('pds/education/secondary')
export class PDSEducationSecondaryController{
   constructor(private pdsEducationSecondaryService: PDSEducationSecondaryService){}
   
   @Post(':applicant_id')
   async addSecondary(@Param('applicant_id') externalApplicantId: string, 
   @Body() pdsEducationSecondaryDTO: PDSEducationDTO){
        return await this.pdsEducationSecondaryService.saveEntity({externalApplicantId, ...pdsEducationSecondaryDTO});
   }

   @Put(':applicant_id')
   async updateSecondary(@Param('applicant_id') externalApplicantId: string, 
   @Body() pdsEducationSecondaryDTO: PDSEducationDTO){
        return await this.pdsEducationSecondaryService.updateEntity({externalApplicantId, ...pdsEducationSecondaryDTO});
   }

   @Delete(':applicant_id')
   async deleteSecondary(@Param('applicant_id') externalApplicantId: string){
       return await this.pdsEducationSecondaryService.deleteSecondary(externalApplicantId);
   }
}