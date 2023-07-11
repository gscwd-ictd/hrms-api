import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { brotliDecompressSync } from 'zlib';
import { PlantillaPositionsAddDTO, PlantillaPositionsDTO } from './data/dtos/plantilla-positions.dto';
import { PlantillaPositionsService } from './plantilla-positions.service';

@Controller('plantilla-positions')
export class PlantillaPositionsController {
  constructor(private plantillaPositionsService: PlantillaPositionsService) {}
  @Get()
  async getPositionsPerOrgStruct() {
    return await this.plantillaPositionsService.getPositionsPerOrgStruct();
  }

  @Get('without-occupation')
  async getPositionsPerOrgStructWithOutOccupation() {
    return await this.plantillaPositionsService.getPositionsPerOrgStructWithOutOccupation();
  }

  @Post()
  async addNewPosition(@Body() addPositionDTO: PlantillaPositionsAddDTO) {
    return await this.plantillaPositionsService.addNewPosition(addPositionDTO);
  }

  @Patch(':position_id')
  async updatePosition(@Param('position_id') positionId: string, @Body() updatePositionDTO: PlantillaPositionsAddDTO) {
    return await this.plantillaPositionsService.updatePosition(positionId, updatePositionDTO);
  }
}
