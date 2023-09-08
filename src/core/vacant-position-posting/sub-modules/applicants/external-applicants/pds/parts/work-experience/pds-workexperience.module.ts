import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSWorkExperience } from './data/entities/pds-workexperience.entity';
import { PDSWorkExperienceController } from './pds-workexperience.controller';
import { PDSWorkExperienceService } from './pds-workexperience.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSWorkExperience])],
  providers: [PDSWorkExperienceService],
  controllers: [PDSWorkExperienceController],
  exports: [PDSWorkExperienceService],
})
export class PDSWorkExperienceModule {}
