import { Body, Controller, Get, HttpException, Param, Patch, Post, Put } from '@nestjs/common';
import { PrimaryGeneratedColumn } from 'typeorm';
import { PDSBasicAddressDTO } from './data/dto/basic-address.dto';
import { PDSBasicPermanentAddressService } from './pds-basic-permanent-address/pds-basic-permanent-address.service';
import { PDSBasicResidentialAddressService } from './pds-basic-residential-address/pds-basic-residential-address.service';

@Controller('pds/basic-personal-info/address')
export class PDSBasicAddressController {
  constructor(private residentialAddress: PDSBasicResidentialAddressService, private permanentAddress: PDSBasicPermanentAddressService) {}

  @Put('/permanent/:applicant_id')
  async updatePermanentAddress(@Param('applicant_id') applicantId: string, @Body() permanentAddressDTO: PDSBasicAddressDTO) {
    if (
      (
        await this.permanentAddress.entityRepository
          .createQueryBuilder('pa')
          .update()
          .set(permanentAddressDTO)
          .where('external_applicant_id_fk=:applicantId', { applicantId })
          .execute()
      ).affected > 0
    )
      return { applicantId, ...permanentAddressDTO };
    throw new HttpException('PDS Record not found', 404);
  }

  @Put('/residential/:applicant_id')
  async updateResidentialAddress(@Param('applicant_id') applicantId: string, @Body() residentialAddressDTO: PDSBasicAddressDTO) {
    if (
      (
        await this.residentialAddress.entityRepository
          .createQueryBuilder('pa')
          .update()
          .set(residentialAddressDTO)
          .where('external_applicant_id_fk=:applicantId', { applicantId })
          .execute()
      ).affected > 0
    )
      return { applicantId, ...residentialAddressDTO };
    throw new HttpException('PDS Record not found', 404);
  }
}
