import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSEducationVocational } from './data/entities/pds-education-vocational.entity';
import { PDSEducationVocationalController } from './pds-education-vocational.controller';
import { PDSEducationVocationalService } from './pds-education-vocational.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSEducationVocational])],
  providers: [PDSEducationVocationalService],
  controllers: [PDSEducationVocationalController],
  exports: [PDSEducationVocationalService],
})
export class PDSEducationVocationalModule {}
