import { Module } from '@nestjs/common';
import { OrganizationalPositionsService } from './organizational-positions.service';
import { OrganizationalPositionsController } from './organizational-positions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficePositionsService } from './office-positions/office-positions.service';
import { DepartmentPositionService } from './department-positions/department-positions.service';
import { DivisionPositionsService } from './division-positions/division-positions.service';
import { DepartmentPositions } from './department-positions/data/entities/department-positions.entity';
import { DivisionPositions } from './division-positions/data/dtos/division-positions.entity';
import { OfficePositions } from './office-positions/data/entities/office-positions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OfficePositions, DivisionPositions, DepartmentPositions])],
  providers: [
    OrganizationalPositionsService,
    OfficePositionsService,
    DepartmentPositionService,
    DivisionPositionsService,
  ],
  controllers: [OrganizationalPositionsController],
})
export class OrganizationalPositionsModule {}
