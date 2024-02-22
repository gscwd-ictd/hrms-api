import { Controller, Get, Param } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get()
  async getAll() {
    return await this.organizationService.getAllOrgStructs();
  }

  @Get('/dropdown/')
  async getAllOrgStructsLabelValue() {
    return await this.organizationService.getAllOrgStructsLabelValue();
  }

  @Get('mixed')
  async getAllOrgStructsMixed() {
    return await this.organizationService.getAllOrgStructsMixed();
  }

  //#region office

  @Get('office')
  async getOffices() {
    return await this.organizationService.getOffices();
  }

  //   @Get('office/positions')
  //   async getOfficePositions() {
  //     return 'positions';
  //   }

  @Get('office/:id')
  async getOfficeById(@Param('id') _id: string) {
    return await this.organizationService.getOfficeById(_id);
  }

  @Get('office/:id/positions')
  async getPositionsByOfficeId(@Param('id') officeId: string) {
    return await this.organizationService.getPositionsPerOffice(officeId);
  }

  @Get('office/:id/positions/:position_id')
  async getPositionByOfficeIdandPositionId(@Param('id') officeId: string, @Param('position_id') positionId: string) {
    return await this.organizationService.getPositionsPerOffice(officeId, positionId);
  }
  //#endregion office

  //#region Department

  @Get('office/:office_id/departments')
  async getDepartments(@Param('office_id') officeId: string) {
    return await this.organizationService.getDepartments(officeId);
  }

  @Get('office/:office_id/departments/:department_id')
  async getDepartmentByOfficeIdandDepartmentId(@Param('office_id') officeId: string, @Param('department_id') departmentId: string) {
    return await this.organizationService.getDepartmentByOfficeIdandDepartmentId(officeId, departmentId);
  }

  @Get('office/:office_id/departments/:department_id/positions')
  async getDepartmentPositions(@Param('office_id') officeId: string, @Param('department_id') departmentId: string) {
    return await this.organizationService.getPositionsPerDepartment(officeId, departmentId);
  }

  @Get('office/:office_id/departments/:department_id/positions/:position_id')
  async getDepartmentPositionById(@Param('office_id') officeId: string, @Param('department_id') departmentId: string, @Param('position_id') positionId: string) {
    return await this.organizationService.getPositionsPerDepartment(officeId, departmentId, positionId);
  }

  //#endregion Departments

  //#region divisions

  @Get('office/:office_id/departments/:department_id/divisions')
  async getDivisions(@Param('office_id') officeId: string, @Param('department_id') departmentId: string) {
    //return await this.organizationService.divisionRepository.find();
    return await this.organizationService.getDivisions(officeId, departmentId);
  }

  @Get('office/:office_id/departments/:department_id/divisions/:division_id')
  async getDivisionById(@Param('office_id') officeId: string, @Param('department_id') departmentId: string, @Param('division_id') _id: string) {
    return await this.organizationService.getDivisions(officeId, departmentId, _id);
  }

  @Get('office/:office_id/departments/:department_id/divisions/:division_id/positions')
  async getPositionsByDivisionId(@Param('office_id') officeId: string, @Param('department_id') departmentId: string, @Param('division_id') divisionId: string) {
    return await this.organizationService.getDivisionPositions(officeId, departmentId, divisionId);
  }

  @Get('office/:office_id/departments/:department_id/divisions/:division_id/positions/:id')
  async getPositionByDivisionIdandPositionId(
    @Param('office_id') officeId: string,
    @Param('department_id') departmentId: string,
    @Param('division_id') divisionId: string,
    @Param('id') _id: string,
  ) {
    return await this.organizationService.getDivisionPositions(officeId, departmentId, divisionId, _id);
  }

  //#endregion
}
