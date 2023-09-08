import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { PDSEducationElementaryDTO } from '../data/dtos/pds-education.dto';
import { PDSEducationElementaryService } from './pds-education-elementary.service';

@Controller('pds/education/elementary')
export class PDSEducationElementaryController {
  constructor(private pdsEducationElementaryService: PDSEducationElementaryService) {}

  @Put(':applicant_id')
  async updateElementaryEducation(@Param('applicant_id') applicantId: string, @Body() pdsEducationElementaryDTO: PDSEducationElementaryDTO) {
    return await this.pdsEducationElementaryService.updateElementaryEducation(applicantId, pdsEducationElementaryDTO);
  }

  @Delete(':applicant_id')
  async deleteElementaryEducation(@Param('applicant_id') applicantId: string) {
    return await this.pdsEducationElementaryService.deleteElementaryEducation(applicantId);
  }

  @Post(':applicant_id')
  async addElementaryEducation(@Param('applicant_id') externalApplicantId: string, @Body() pdsEducationElementaryDTO: PDSEducationElementaryDTO) {
    return await this.pdsEducationElementaryService.saveEntity({ externalApplicantId, ...pdsEducationElementaryDTO });
  }
}
