import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proficiency } from 'src/core/proficiency/data/entities/proficiency.entity';
import { ProficiencyController } from './proficiency.controller';
import { ProficiencyService } from './proficiency.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proficiency])],
  controllers: [ProficiencyController],
  providers: [ProficiencyService],
  exports: [ProficiencyService],
})
export class ProficiencyModule {}
