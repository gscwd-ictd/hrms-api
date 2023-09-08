import { Controller, Param, Put, Delete, Post, Body } from '@nestjs/common';
import { PDSBasicGovernmentAgenciesIdsDTO } from './data/dtos/pds-basic-government-agencies-id.dto';
import { PDSBasicGovernmentAgenciesIdsService } from './pds-basic-government-agencies-ids.service';

@Controller('pds/basic-info/government-ids/')
export class PDSBasicGovernmentAgenciesIdsController {
  constructor(private governmentAgenciesIdService: PDSBasicGovernmentAgenciesIdsService) {}

  @Post(':applicant_id')
  async addGovernmentIds(@Param('applicant_id') externalApplicantId: string, @Body() governmentAgenciesIdDTO: PDSBasicGovernmentAgenciesIdsDTO) {
    return await this.governmentAgenciesIdService.saveEntity({ externalApplicantId, ...governmentAgenciesIdDTO });
  }

  @Put(':applicant_id')
  async updateGovernmentIds(@Param('applicant_id') applicantId: string, governmentAgenciesIdDTO: PDSBasicGovernmentAgenciesIdsDTO) {
    return await this.governmentAgenciesIdService.updateGovernmentIds(applicantId, governmentAgenciesIdDTO);
  }

  @Delete('_id')
  async deleteGovernmentIds(_id: string) {
    return await this.governmentAgenciesIdService.removeEntity(_id);
  }
}
