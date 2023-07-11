import { AuthenticatedGuard } from './../../global/auth/guards/authenticated2.guard';
import { ScopeGuard } from 'src/global/auth/guards/scope.guard';
import { Controller, Post, Get, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { DomainDto } from './data/dtos/domain.dto';
import { DomainService } from './domain.service';

//@UseGuards(AuthenticatedGuard)
@Controller('domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get()
  async getDomains() {
    return await this.domainService.findEntityAll();
  }

  @Get('/:id')
  async getSingleDomain(@Param('id') _id: string) {
    return await this.domainService.findEntityById(_id);
  }

  @Post()
  async createDomain(@Body() domain: DomainDto) {
    return await this.domainService.saveEntity(domain);
  }

  @Put('/:id')
  async updateDomain(@Param('id') _id: string, @Body() domain: DomainDto) {
    return await this.domainService.updateEntity({
      _id,
      ...domain,
    });
  }

  @Delete('/:id')
  async deleteDomain(@Param('id') _id: string) {
    return await this.domainService.removeEntity(_id);
  }
}
