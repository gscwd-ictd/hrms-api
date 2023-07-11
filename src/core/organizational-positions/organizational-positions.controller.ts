import { Controller, Get, Param } from '@nestjs/common';
import { OrganizationalPositionsService } from './organizational-positions.service';

@Controller('organizational-positions')
export class OrganizationalPositionsController {
  constructor(private organizationPositionsService: OrganizationalPositionsService) {}

  @Get(':assignment_id/:employee_id')
  async getOrganizationAssignmentPositions(@Param('assignment_id') assignmentId: string, @Param('employee_id') employeeId: string) {
    return await this.organizationPositionsService.getAssignmentPositions(assignmentId, employeeId);
  }
}
