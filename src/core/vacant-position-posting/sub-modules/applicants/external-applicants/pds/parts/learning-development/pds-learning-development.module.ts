import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSLearningDevelopment } from './data/entities/pds-learning-development.entity';
import { PDSLearningDevelopmentController } from './pds-learning-development.controller';
import { PDSLearningDevelopmentService } from './pds-learning-development.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSLearningDevelopment])],
  controllers: [PDSLearningDevelopmentController],
  providers: [PDSLearningDevelopmentService],
  exports: [PDSLearningDevelopmentService],
})
export class PDSLearningDevelopmentModule {}
