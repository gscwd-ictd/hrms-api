import { PositionDescriptionFormController } from './../../position-description-form.controller';
import { PositionDescriptionFormBasicService } from './basic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionDescriptionFormBasic } from './data/position-description-form-basic.entity';
import { Module } from '@nestjs/common';
import { PositionDescriptionFormBasicController } from './basic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PositionDescriptionFormBasic])],
  providers: [PositionDescriptionFormBasicService],
  controllers: [PositionDescriptionFormBasicController],
  exports: [PositionDescriptionFormBasicService, TypeOrmModule.forFeature([PositionDescriptionFormBasic])],
})
export class PositionDescriptionFormBasicModule {}
