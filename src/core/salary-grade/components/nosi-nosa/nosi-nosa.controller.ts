import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NosiNosaService } from './nosi-nosa.service';
import { NosiNosaDto, ServiceRecordDto } from './data/dto/nosi-nosa.dto';
import { NosiNosaViewService } from './nosi-nosa-view.service';

@Controller('nosi-nosa')
export class NosiNosaController {
  constructor(private readonly nosiNosaService: NosiNosaService, private readonly nosiNosaViewService: NosiNosaViewService) {}

  @Post()
  async addNosiNosa(@Body() nosiNosaDto: NosiNosaDto) {
    return await this.nosiNosaService.saveEntity(nosiNosaDto);
  }

  @Post('service-record')
  async addServiceRecord(@Body() serviceRecordDto: ServiceRecordDto) {
    return await this.nosiNosaService.addServiceRecord(serviceRecordDto);
  }

  @Get(':employee_id')
  async getNosiNosaLedgerByEmployeeId(@Param('employee_id') employeeId: string) {
    return await this.nosiNosaService.getNosiNosaLedgerByEmployeeId(employeeId);
  }

  @Get('')
  async getEmployeesForNosiNosa() {
    return await this.nosiNosaService.getForNosiList();
  }

  @Delete(':nosi_nosa_id')
  async deleteNosiNosaEntry(@Param('nosi_nosa_id') _id: string) {
    return await this.nosiNosaService.removeEntity(_id);
  }
}
