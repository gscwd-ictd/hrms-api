import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Departments } from 'src/core/organization/department/data/entities/departments.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'department_positions' })
export class DepartmentPositions extends DefaultTable {
  @JoinColumn({ name: 'department_id_fk' })
  @ManyToOne(() => Departments, (department) => department._id, { onUpdate: 'CASCADE' })
  departmentId: Departments;

  @JoinColumn({ name: 'position_id_fk' })
  @ManyToOne(() => PlantillaPositions, (position) => position._id, { onUpdate: 'CASCADE' })
  positionId: PlantillaPositions;

  @Column({ type: 'text' })
  summary: string;
}
