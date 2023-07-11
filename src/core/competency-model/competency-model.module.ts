import { Module } from '@nestjs/common';
import { CompetencyModelService } from './competency-model.service';
import { CompetencyModelController } from './competency-model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyModel } from './data/entities/competency-model.entity';
import { JwtStrategy } from 'src/global/auth/strategies/jwt.strategy';
import { CompetencyModelView } from './data/entities/views/competency-model-view.entity';
import { Proficiency } from '../proficiency/data/entities/proficiency.entity';
import { ProficiencyService } from '../proficiency/proficiency.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetencyModel, Proficiency, CompetencyModelView])],
  providers: [CompetencyModelService, ProficiencyService, JwtStrategy],
  controllers: [CompetencyModelController],
  exports: [CompetencyModelService],
})
export class CompetencyModelModule {}
