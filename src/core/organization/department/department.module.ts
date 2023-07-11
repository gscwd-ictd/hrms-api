import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentsController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departments } from './data/entities/departments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departments])],
  providers: [DepartmentService],
  controllers: [DepartmentsController],
})
export class DepartmentsModule {}
