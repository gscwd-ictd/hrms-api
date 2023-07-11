import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionsController } from './division.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Divisions } from './data/entities/divisions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Divisions])],
  providers: [DivisionService],
  controllers: [DivisionsController],
})
export class DivisionsModule {}
