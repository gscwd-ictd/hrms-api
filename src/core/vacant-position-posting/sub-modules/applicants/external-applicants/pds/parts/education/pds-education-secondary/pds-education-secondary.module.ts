import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSEducationSecondary } from './data/entities/pds-education-secondary.entity';
import { PDSEducationSecondaryController } from './pds-education-secondary.controller';
import { PDSEducationSecondaryService } from './pds-education-secondary.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSEducationSecondary])],
  providers: [PDSEducationSecondaryService],
  controllers: [PDSEducationSecondaryController],
  exports: [PDSEducationSecondaryService],
})
export class PDSEducationSecondaryModule {}
