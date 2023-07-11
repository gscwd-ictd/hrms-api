import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Column, Entity } from 'typeorm';
import { RatingFor } from '../../utils/rating-percentage.enum';

@Entity({ name: 'settings_interview_rating_percentage' })
export class RatingPercentage extends DefaultTable {
  //rating_for,           core_percentage, functional_managerial_percentage, examination_results
  //rank_file_with_exam    30               30                                40
  //rank_file_without_exam 40               60                                0
  //managerial_without_exam 50              50                                0

  @Column({ name: 'rating_for', type: 'enum', enum: RatingFor })
  ratingFor: string;

  @Column({ name: 'core', type: 'decimal', precision: 5, scale: 2 })
  core: number;

  @Column({ name: 'functional_managerial', type: 'decimal', precision: 5, scale: 2 })
  functionalManagerial: number;

  @Column({ name: 'exam' })
  exam: number;
}
