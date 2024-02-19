import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeTags } from './data/employee-tags.entity';
import { EmployeeTagsController } from './employee-tags.controller';
import { EmployeeTagsService } from './employee-tags.service';
import { CommitteeMembersModule } from '../committee-members/committee-members.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeTags])],
  providers: [EmployeeTagsService],
  controllers: [EmployeeTagsController],
  exports: [EmployeeTagsService],
})
export class EmployeeTagsModule {}
