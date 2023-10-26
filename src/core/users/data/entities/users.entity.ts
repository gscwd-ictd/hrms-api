import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Employees } from 'src/core/employees/data/entities/employees.entity';
import { DefaultTable, LogEntity } from 'src/core/base-entity/data/base.entity';

@Entity({ name: 'users' })
export class Users extends LogEntity {
  @PrimaryColumn({ type: 'uuid' })
  _id: string;

  @OneToOne(() => Employees, (employee) => employee._id)
  @JoinColumn({ name: 'employee_id_fk' })
  employeeId: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;
}
