import { Module } from '@nestjs/common';
import { SalaryGradeService } from './salary-grade.service';
import { SalaryGradeController } from './salary-grade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryGrade } from './data/entities/salary-grade.entity';
import { MulterModule } from '@nestjs/platform-express';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import { createBrotliCompress } from 'zlib';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([SalaryGrade])],
  providers: [SalaryGradeService],
  controllers: [SalaryGradeController],
})
export class SalaryGradeModule {}
