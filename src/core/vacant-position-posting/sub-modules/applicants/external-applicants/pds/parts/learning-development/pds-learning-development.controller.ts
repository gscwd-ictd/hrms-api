import { Body, Controller, Delete, Param, Post, Put } from "@nestjs/common";
import { PDSLearningDevelopmentDTO } from "./data/dtos/pds-learning-development.dto";
import { PDSLearningDevelopmentService } from "./pds-learning-development.service";

@Controller('/pds/learning-development')
export class PDSLearningDevelopmentController{
    constructor(private pdsLearningDevelopmentService: PDSLearningDevelopmentService){}
    @Post(':applicant_id')
    async addLearningDevelopment(
        @Param('applicant_id') applicantId: string, 
        @Body() pdsLearningDevelopmentDTO: PDSLearningDevelopmentDTO[]
    ){
        return await this.pdsLearningDevelopmentService.addLearningDevelopment(applicantId, pdsLearningDevelopmentDTO);
    }

    @Put(':_id')
    async updateLearningDevelopment(
        @Param('_id') _id: string, 
        @Body() pdsLearningDevelopmentDTO: PDSLearningDevelopmentDTO )
    {
        return await this.pdsLearningDevelopmentService.updateEntity({_id, ...pdsLearningDevelopmentDTO});
    }

    @Delete(':_id')
    async deleteLearningDevelopment(@Param('_id') _id : string){
        return await this.pdsLearningDevelopmentService.removeEntity(_id);
    }
}