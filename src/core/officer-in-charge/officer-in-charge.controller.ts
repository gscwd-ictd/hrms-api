import { OfficerInChargeService } from './officer-in-charge.service';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { OfficerInChargeDTO } from './data/officer-incharge.dto';

@Controller('officer-in-charge')
export class OfficerInChargeController {
  constructor(private readonly officerInChargeService: OfficerInChargeService) {}

  @Get()
  async getAllOfficerInCharge() {
    return await this.officerInChargeService.getAllOfficerInCharge();
  }

  @Get('qualified-employees')
  async getQualifiedForOfficerInCharge() {
    return await this.officerInChargeService.getQualifiedForOfficerInCharge();
  }

  @Get('oic-managerial-positions')
  async getManagerialPositionsForOIC() {
    return await this.officerInChargeService.getManagerialPositionsForOIC();
  }

  @Post()
  async addOfficerInCharge(@Body() oicDTO: OfficerInChargeDTO) {
    return await this.officerInChargeService.addOfficerInCharge(oicDTO);
  }

  @Delete(':_id')
  async deleteOfficerInCharge(@Param('_id') _id: string) {
    return await this.officerInChargeService.deleteOfficerInCharge(_id);
  }
}
