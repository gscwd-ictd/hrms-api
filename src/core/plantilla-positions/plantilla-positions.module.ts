import { Module } from '@nestjs/common';
import { PlantillaPositionsService } from './plantilla-positions.service';
import { PlantillaPositionsController } from './plantilla-positions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantillaPositions } from './data/entities/plantilla-positions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlantillaPositions])],
  providers: [PlantillaPositionsService],
  controllers: [PlantillaPositionsController],
})
export class PlantillaPositionsModule {}
