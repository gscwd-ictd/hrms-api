import { Body, Controller, HttpException, Param, Post, Put } from '@nestjs/common';
import { PDSBasicPersonalInfoDTO } from './data/dtos/pds-basic-personal-info.dto';
import { PDSBasicPersonalInfoService } from './pds-basic-personal-info.service';

@Controller('pds/basic-info/personal-info')
export class PDSBasicPersonalInfoController {
  constructor(private personalInfoService: PDSBasicPersonalInfoService) {}
  @Put(':applicant_id')
  async updatePersonalInfo(@Param(':applicant_id') applicantId: string, @Body() personalInfoDTO: PDSBasicPersonalInfoDTO) {
    return await this.personalInfoService.updatePersonalInfo(applicantId, personalInfoDTO);
  }
}
