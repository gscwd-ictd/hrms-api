import { DutiesResponsibilities } from 'src/core/duties-responsibilities/data/entities/duties-resposibilities.entity';
import { Occupation } from 'src/core/occupation/data/entities/occupation.entity';
import { OccupationalGroupDutiesResponsibilities } from 'src/core/occupational-group-duties-responsibilities/data/entities/occupational-group-duties-responsibilities.entity';
import { Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DefaultTable } from '../../../base-entity/data/base.entity';

@Entity({ name: 'occupations_duties_responsibilities' })
@Index(['occupationId', 'dutiesResponsibilities'], { unique: true })
export class OccupationsDutiesResponsibilities extends DefaultTable {
  @ManyToOne(() => Occupation, (occupation) => occupation._id, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'occupation_id_fk' })
  occupationId: Occupation;

  @ManyToOne(() => DutiesResponsibilities, (dr) => dr._id)
  @JoinColumn({ name: 'duties_responsibilities_id_fk' })
  dutiesResponsibilities: DutiesResponsibilities;

  @OneToMany(() => OccupationalGroupDutiesResponsibilities, (ogdr) => ogdr._id)
  ogdr: OccupationalGroupDutiesResponsibilities[];
}
