import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { PDSFamilyParentsDTO } from './data/dto/pds-family-parents.dto';
import { PDSFamilyParentsService } from './pds-family-parents.service';

@Controller('pds/family-background/parents')
export class PDSFamilyParentsController {
  constructor(private pdsFamilyParentsService: PDSFamilyParentsService) {}

  @Post(':applicant_id')
  async addParents(@Param('applicant_id') externalApplicantId: string, @Body() pdsFamilyParentsDTO: PDSFamilyParentsDTO) {
    return await this.pdsFamilyParentsService.saveEntity({ externalApplicantId, ...pdsFamilyParentsDTO });
  }

  @Put(':applicant_id')
  async updateParents(@Param('_id') _id: string, @Body() pdsFamilyParentsDTO: PDSFamilyParentsDTO) {
    return await this.pdsFamilyParentsService.updateEntity({ _id, ...pdsFamilyParentsDTO });
  }
}
