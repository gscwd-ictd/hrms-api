import { DefaultTable } from 'src/core/base-entity/data/base.entity';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { OccupationalGroup } from 'src/core/occupational-group/data/entities/occupational-group.entity';
import { DepartmentPositions } from 'src/core/organizational-positions/department-positions/data/entities/department-positions.entity';
import { OfficePositions } from 'src/core/organizational-positions/office-positions/data/entities/office-positions.entity';
import { QualificationStandards } from 'src/core/qualification-standards/data/entities/qualification-standards.entity';
import { SalaryGrade } from 'src/core/salary-grade/data/entities/salary-grade.entity';
import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';
import { Entity, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'plantilla_positions' })
export class PlantillaPositions extends DefaultTable {
  @Column({ name: 'item_number', nullable: true })
  itemNumber: string;

  @Column({ name: 'position_title' })
  positionTitle: string;

  @Column({
    type: 'enum',
    enum: NatureOfAppointment,
    name: 'nature_of_appointment',
    default: NatureOfAppointment.PERMANENT,
  })
  natureOfAppointment: NatureOfAppointment;

  //foreign keys
  @OneToOne(() => Employees, (employees) => employees._id)
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: string;

  @ManyToOne(() => SalaryGrade, (sg) => sg._id)
  @JoinColumn({ name: 'salary_grade_id_fk' })
  salaryGrade: SalaryGrade;

  @Column({ name: 'daily_rate', nullable: true, type: 'decimal', precision: 7, scale: 2 })
  dailyRate: number;

  @OneToMany(() => DepartmentPositions, (deptPos) => deptPos.positionId)
  deptPos: DepartmentPositions[];

  @OneToMany(() => QualificationStandards, (qs) => qs.positionId)
  qs: QualificationStandards[];

  @OneToMany(() => OfficePositions, (officePosition) => officePosition.positionId)
  officePosition: OfficePositions[];

  @OneToMany(() => OccupationalGroup, (occupationgroup) => occupationgroup.positionId)
  occupationalgroup: OccupationalGroup[];

  @Column({ name: 'step_increment_start', type: 'date', nullable: true })
  stepIncrementStart: Date;

  @Column({ name: 'step_increment_end', type: 'date', nullable: true })
  stepIncrementEnd: Date;
}
