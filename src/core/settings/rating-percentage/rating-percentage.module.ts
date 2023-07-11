import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingPercentage } from './data/entities/rating-percentage.entity';
import { RatingPercentageController } from './rating-percentage.controller';
import { RatingPercentageService } from './rating-percentage.service';

@Module({
  imports: [TypeOrmModule.forFeature([RatingPercentage])],
  providers: [RatingPercentageService],
  controllers: [RatingPercentageController],
})
export class RatingPercentageModule {}
