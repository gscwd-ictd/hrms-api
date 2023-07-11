import { Module } from '@nestjs/common';
import { QualificationStandardsService } from './qualification-standards.service';
import { QualificationStandardsController } from './qualification-standards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualificationStandards } from 'src/core/qualification-standards/data/entities/qualification-standards.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QualificationStandards])],
  providers: [QualificationStandardsService],
  controllers: [QualificationStandardsController],
  exports: [QualificationStandardsService, TypeOrmModule.forFeature([QualificationStandards])],
})
export class QualificationStandardsModule {}
