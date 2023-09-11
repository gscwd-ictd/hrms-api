import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentPositions } from '../organizational-positions/department-positions/data/entities/department-positions.entity';
import { DepartmentPositionService } from '../organizational-positions/department-positions/department-positions.service';
import { DivisionPositions } from '../organizational-positions/division-positions/data/dtos/division-positions.entity';
import { DivisionPositionsService } from '../organizational-positions/division-positions/division-positions.service';
import { OfficePositions } from '../organizational-positions/office-positions/data/entities/office-positions.entity';
import { OfficePositionsService } from '../organizational-positions/office-positions/office-positions.service';
import { Departments } from './department/data/entities/departments.entity';
import { DepartmentService } from './department/department.service';
import { Divisions } from './division/data/entities/divisions.entity';
import { DivisionService } from './division/division.service';
import { Office } from './office/data/entities/office.entity';
import { OfficeService } from './office/office.service';
import { OrganizationMsController } from './organization-ms.controller';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Office, OfficePositions, Divisions, DivisionPositions, Departments, DepartmentPositions])],
  controllers: [OrganizationController, OrganizationMsController],
  providers: [OrganizationService, OfficeService, OfficePositionsService, DivisionService, DivisionPositionsService, DepartmentService, DepartmentPositionService],
})
export class OrganizationModule {}
