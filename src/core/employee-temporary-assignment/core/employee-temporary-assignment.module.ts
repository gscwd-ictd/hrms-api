import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeTemporaryAssignment } from '../data';
import { EmployeeTemporaryAssignmentService } from './employee-temporary-assignment.service';
import { EmployeeTemporaryAssignmentController } from './employee-temporary-assignment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeTemporaryAssignment])],
  controllers: [EmployeeTemporaryAssignmentController],
  providers: [EmployeeTemporaryAssignmentService],
  exports: [EmployeeTemporaryAssignmentService],
})
export class EmployeeTemporaryAssignmentModule {}
