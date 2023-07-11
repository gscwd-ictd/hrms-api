import { Controller, Get, HttpException, HttpStatus, Param, UseGuards, Headers } from '@nestjs/common';
import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';
import { PlantillaViewService } from './plantilla-view.service';

@Controller('plantilla')
export class PlantillaViewController {
  constructor(private readonly plantillaViewService: PlantillaViewService) {}

  @Get('/')
  async findAllPermanentPlantillaPositions(@Headers('Authorization') auth: string) {
    //console.log(auth);
    return await this.plantillaViewService.findEntityAll();
  }

  @Get('/casual/')
  async findAllCasualPlantillaPositions(@Headers('Authorization') auth: string) {
    //console.log(auth);
    return await this.plantillaViewService.entityRepository.find({ where: { natureOfAppointment: NatureOfAppointment.CASUAL } });
  }

  @Get(':id')
  async findPlantillaPosition(@Param('id') positionId: string) {
    return await this.plantillaViewService.entityRepository.findOne({ where: { positionId } });
  }

  @Get('/duties/single/:id')
  async getDuties(@Param('id') _id: string) {
    try {
      return await this.plantillaViewService.getDuties(_id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/job-description/single/:id')
  async getJD(@Param('id') _id: string) {
    try {
      return await this.plantillaViewService.getJD(_id);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get('/position-description/single/:position_id')
  async getPositionDescription(@Param('position_id') positionId: string) {
    try {
      const jobDescription = await this.plantillaViewService.getJD(positionId);
      return jobDescription;
    } catch (error) {}
  }
}
