import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee201 } from './entities/employee201.entity';
import { Employee201Service } from './employee201.service';
import { Employee201Controller } from './employee201.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee201])],
  providers: [Employee201Service],
  controllers: [Employee201Controller],
  exports: [Employee201Service],
})
export class Employee201Module {}
