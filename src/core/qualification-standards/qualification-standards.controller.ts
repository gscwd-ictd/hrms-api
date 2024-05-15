import { UserLogsInterceptor } from './../../global/user-logs/interceptors/user-logs.interceptor';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/global/auth/guards/authenticated2.guard';
import { QualificationStandardsDto } from 'src/core/qualification-standards/data/dtos/qualification-standards.dto';
import { QualificationStandardsService } from './qualification-standards.service';

// @UseGuards(AuthenticatedGuard)
// @UseInterceptors(UserLogsInterceptor)
@Controller('qualification-standards')
export class QualificationStandardsController {
  constructor(private qualificationStandardsService: QualificationStandardsService) {}

  @Get()
  async findAllQs(@Query('position') positionId?: string) {
    if (positionId) return await this.qualificationStandardsService.getQsByPositionId(positionId);
    else return await this.qualificationStandardsService.getAllQs();
  }

  @Get('single/:id')
  async getQsByPositionId(@Param('id') positionId: string) {
    return await this.qualificationStandardsService.getQsByPositionId(positionId);
  }

  @Post()
  async saveQualificationStandards(@Body() qualificationStandardsDTO: QualificationStandardsDto) {
    return await this.qualificationStandardsService.saveEntity(qualificationStandardsDTO);
  }

  @Put(':position_id')
  async updateQualificationStandards(@Param('position_id') positionId: string, @Body() qualificationStandardsDTO: QualificationStandardsDto) {
    return await this.qualificationStandardsService.updateQSByPositionId(positionId, qualificationStandardsDTO);
  }

  @Delete(':id')
  async deleteQualificationStandards(@Param('id') _id: string) {
    return await this.qualificationStandardsService.removeEntity(_id);
  }
}
