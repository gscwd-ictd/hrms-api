import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Repository } from 'typeorm';
import { RatingPercentage } from './data/entities/rating-percentage.entity';

@Injectable()
export class RatingPercentageService extends BaseEntityCrudService<RatingPercentage> {
  constructor(@InjectRepository(RatingPercentage) ratingPercentageRepository: Repository<RatingPercentage>) {
    super(ratingPercentageRepository);
  }
}
