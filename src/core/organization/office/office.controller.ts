import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { OrganizationalEntitiesDto } from '../data/dtos/organization.dto';
import { OfficeService } from './office.service';

@Controller('office')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @Get()
  async findOffice() {
    return await this.officeService.findAllOffice();
  }

  @Post()
  async saveOffice(@Body() officeDto: OrganizationalEntitiesDto) {
    return await this.officeService.saveEntity(officeDto);
  }

  @Put('/:id')
  async updateOffice(@Body() officeDto: OrganizationalEntitiesDto, @Param('id') _id: string) {
    return await this.officeService.updateEntity({ ...officeDto, _id });
  }

  @Delete('/:id')
  async removeOffice(@Param('id') _id: string) {
    return await this.officeService.removeEntity(_id);
  }
}
