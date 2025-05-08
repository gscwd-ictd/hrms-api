import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Employees } from '../../data/entities/employees.entity';
import { PlantillaPositions } from 'src/core/plantilla-positions/data/entities/plantilla-positions.entity';
import { SalaryGrade } from 'src/core/salary-grade/data/entities/salary-grade.entity';
import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';

@Entity({ name: 'employee_201' })
export class Employee201 extends DefaultTable {
  @ManyToOne(() => Employees, (emp) => emp._id)
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: string;

  @ManyToOne(() => PlantillaPositions, (pp) => pp._id)
  @JoinColumn({ name: 'position_id_fk' })
  positionId: string;

  @Column({ name: 'name' })
  positionTitle: string;

  @ManyToOne(() => SalaryGrade, (sg) => sg._id)
  @JoinColumn({ name: 'salary_grade_id' })
  salaryGradeId: string;

  @Column({ name: 'nature_of_appointment', enum: NatureOfAppointment })
  natureOfAppointment: NatureOfAppointment;

  @Column({ name: 'date_from', type: 'date' })
  dateFrom: Date;

  @Column({ name: 'date_to', type: 'date', nullable: true })
  dateTo: Date;
}
