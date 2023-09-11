import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { PDSEducationDTO, PDSSchoolsAttended } from '../data/dtos/pds-education.dto';
import { PDSEducationCollegeService } from './pds-education-college.service';

@Controller('pds/education/college')
export class PDSEducationCollegeController {
  constructor(private pdsEducationCollege: PDSEducationCollegeService) {}

  /**
   * Add an array of PDSEducationCollege Objects
   * @param applicantId
   * @param collegeDTO
   * @returns array of PDSEducationCollege added
   */
  @Post(':applicant_id')
  async addCollege(@Param('applicant_id') applicantId: string, @Body() collegeDTO: PDSSchoolsAttended) {
    return await this.pdsEducationCollege.addCollege(applicantId, collegeDTO);
  }

  /**
   * Update College Attended
   * @param _id The ID of the College Attended
   * @param collegeDTO College Details
   * @returns PDSEducationCollege Entity
   */
  @Put(':_id')
  async updateCollege(@Param('_id') _id: string, @Body() collegeDTO: PDSEducationDTO) {
    return await this.pdsEducationCollege.updateEntity({ _id, ...collegeDTO });
  }

  /**
   * Remove College Attended by the Applicant
   * @param _id The ID of the College Attended
   * @returns Removed PDSEducationCollege entity
   */
  @Delete(':_id')
  async deleteCollege(@Param('_id') _id: string) {
    return await this.pdsEducationCollege.removeEntity(_id);
  }
}
