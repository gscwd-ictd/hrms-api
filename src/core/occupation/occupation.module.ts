import { Module } from '@nestjs/common';
import { OccupationService } from './occupation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationController } from './occupation.controller';
import { Occupation } from './data/entities/occupation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Occupation])],
  providers: [OccupationService],
  controllers: [OccupationController],
  exports: [OccupationService],
})
export class OccupationModule {}
