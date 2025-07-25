import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PrfDetailsDTO, UpdatePrfDetailsDto } from './data/dto/prf-details.dto';
import { PrfDetailsService } from './prf-details.service';

@Controller('prf')
export class PrfDetailsController {
  constructor(private prfDetailsService: PrfDetailsService) {}
  @Get()
  async getAllPrfs() {
    return await this.prfDetailsService.getAllPrfs();
  }

  @Get('details/:prf_id')
  async getPrfsByEmpIdAndPrfDetailsId(@Param('prf_id') _id: string) {
    return await this.prfDetailsService.getPrfsByEmpIdAndPrfDetailsId(_id);
  }

  @Get('approved')
  async getAllApprovedPrfs() {
    return await this.prfDetailsService.getAllPrfsByStatus('approved');
  }

  @Get('approved/v2/:year')
  async getAllApprovedPrfsV2(@Param('year') postingYear: number) {
    return await this.prfDetailsService.getAllApprovedPrfsV2(postingYear);
  }

  @Get('disapproved')
  async getAllDisapprovedPrfs() {
    return await this.prfDetailsService.getAllPrfsByStatus('disapproved');
  }

  @Get('cancelled')
  async getAllCancelledPrfs() {
    return await this.prfDetailsService.getAllPrfsByStatus('cancelled');
  }

  @Get('clear')
  async clearPrf() {
    return await this.prfDetailsService.clearPrfs();
  }

  @Get(':emp_id?')
  async getPrfsByEmpId(@Param('emp_id') employeeId: string, @Query('status') status: string) {
    return await this.prfDetailsService.getPrfsByEmpId(employeeId, status);
  }

  @Post()
  async addPrf(@Body() prfDetailsDto: PrfDetailsDTO) {
    return await this.prfDetailsService.addPrf(prfDetailsDto);
  }

  @Patch()
  async cancelPrf(@Body() prfDetailsDTO: UpdatePrfDetailsDto) {
    return await this.prfDetailsService.cancelPrf(prfDetailsDTO);
  }
}
