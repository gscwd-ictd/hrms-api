import { Controller, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { PDSFamilySpouseDTO } from './data/dto/pds-family-spouse.dto';
import { PDSFamilySpouseService } from './pds-family-spouse.service';

@Controller('pds/family-background/spouse')
export class PDSFamilySpouseController {
  constructor(private pdsFamilySpouseService: PDSFamilySpouseService) {}

  @Post(':applicant_id')
  async addSpouse(@Param('applicant_id') externalApplicantId: string, @Body() pdsFamilySpouseDTO: PDSFamilySpouseDTO) {
    return await this.pdsFamilySpouseService.saveEntity({ externalApplicantId, ...pdsFamilySpouseDTO });
  }

  @Put(':_id')
  async updateSpouse(@Param('_id') _id: string, @Body() pdsFamilySpouseDTO: PDSFamilySpouseDTO) {
    return await this.pdsFamilySpouseService.updateEntity({ _id, ...pdsFamilySpouseDTO });
  }

  @Delete(':_id')
  async deleteSpouse(@Param('_id') _id: string) {
    return await this.pdsFamilySpouseService.removeEntity(_id);
  }
}
