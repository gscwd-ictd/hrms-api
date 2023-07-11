import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrganizationService } from './organization.service';

@Controller('organization-ms')
export class OrganizationMsController {
  constructor(private readonly organizationService: OrganizationService) {}

  @MessagePattern('get_organization')
  async getOrganization() {
    return await this.organizationService.getOrganization();
  }

  @MessagePattern('get_organization_by_id')
  async getOrganizationById(@Payload() orgId: string) {
    return await this.organizationService.getOrganizationById(orgId);
  }

  @MessagePattern('get_organization_by_group')
  async getAllOrganizationByGroup() {
    return await this.organizationService.getAllOrganizationByGroup();
  }
}
