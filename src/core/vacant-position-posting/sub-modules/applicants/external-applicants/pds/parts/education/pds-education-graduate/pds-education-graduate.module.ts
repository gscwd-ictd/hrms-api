import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSEducationGraduate } from './data/entities/pds-education-graduate.entity';
import { PDSEducationGraduateController } from './pds-education-graduate.controller';
import { PDSEducationGraduateService } from './pds-education-graduate.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSEducationGraduate])],
  providers: [PDSEducationGraduateService],
  controllers: [PDSEducationGraduateController],
  exports: [PDSEducationGraduateService],
})
export class PDSEducationGraduateModule {}
