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
  @MessagePattern('get_available_org_structs')
  async getAllAvailableOrgStructs(@Payload() orgIds: string[]) {
    return await this.organizationService.getAvailableOrgStructsMixed(orgIds);
  }

  @MessagePattern('get_org_name_by_org_id')
  async getOrgNameByOrgId(@Payload() orgId: string) {
    return await this.organizationService.getOrgNameByOrgId(orgId);
  }
}
