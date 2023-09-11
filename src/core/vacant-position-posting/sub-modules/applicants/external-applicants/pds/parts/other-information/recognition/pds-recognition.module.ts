import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PDSRecognition } from './data/entities/pds-recognition.entity';
import { PDSRecognitionController } from './pds-recognition.controller';
import { PDSRecognitionService } from './pds-recognition.service';

@Module({
  imports: [TypeOrmModule.forFeature([PDSRecognition])],
  providers: [PDSRecognitionService],
  controllers: [PDSRecognitionController],
  exports: [PDSRecognitionService],
})
export class PDSRecognitionModule {}
