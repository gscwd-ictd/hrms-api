import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { SalaryGrade } from 'src/core/salary-grade/data/entities/salary-grade.entity';
import { NosiNosaStatus } from 'src/core/salary-grade/utils/types/salary-grade.type';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'nosi_nosa' })
export class NosiNosa extends DefaultTable {
  @ManyToOne(() => Employees, (employees) => employees._id)
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: string;

  @ManyToOne(() => PlantillaPositions, (pp) => pp._id)
  @JoinColumn({ name: 'position_id_fk' })
  positionId: string;

  @ManyToOne(() => SalaryGrade, (sg) => sg._id)
  @JoinColumn({ name: 'actual_salary_grade_id_fk' })
  actualSalaryGradeId: number;

  @ManyToOne(() => SalaryGrade, (sg) => sg._id)
  @JoinColumn({ name: 'adjusted_salary_grade_id_fk' })
  adjustedSalaryGradeId: number;

  @Column({ name: 'effectivity_date', type: 'date' })
  effectivityDate: Date;

  @Column({ name: 'status', type: 'enum', enum: NosiNosaStatus })
  status: NosiNosaStatus;
}
