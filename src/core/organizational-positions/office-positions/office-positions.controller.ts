import { Controller, Get, Param } from '@nestjs/common';
import { OfficePositionsService } from './office-positions.service';

@Controller('office')
export class OfficePositionsController {
  constructor(private officeService: OfficePositionsService) {}

  @Get()
  async testGet() {
    return 'test';
  }

  @Get('/:id')
  async testGet2(@Param('id') _id: string) {
    return _id;
  }
}
