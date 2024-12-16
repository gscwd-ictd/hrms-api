import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { OrganizationService } from './organization.service';
import { MsExceptionFilter } from 'src/global/utils/filters/rpc-exception.filter';

@UseFilters(new MsExceptionFilter())
@Controller('organization-ms')
export class OrganizationMsController {
  constructor(private readonly organizationService: OrganizationService) { }

  @MessagePattern('get_organization')
  async getOrganization() {
    try {
      return await this.organizationService.getOrganization();
    } catch (error) {
      throw new RpcException(error.message);
    }

  }

  @MessagePattern('get_organization_by_id')
  async getOrganizationById(@Payload() orgId: string) {
    try {
      return await this.organizationService.getOrganizationById(orgId);
    }
    catch (error) {
      throw new RpcException(error.message);
    }

  }

  @MessagePattern('get_organization_by_group')
  async getAllOrganizationByGroup() {
    try {
      return await this.organizationService.getAllOrganizationByGroup();
    }
    catch (error) {
      throw new RpcException(error.message);
    }

  }
  @MessagePattern('get_available_org_structs')
  async getAllAvailableOrgStructs(@Payload() orgIds: string[]) {
    try {
      return await this.organizationService.getAvailableOrgStructsMixed(orgIds);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_org_name_by_org_id')
  async getOrgNameByOrgId(@Payload() orgId: string) {
    try {
      return await this.organizationService.getOrgNameByOrgId(orgId);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('get_all_departments_and_ogm')
  async getAllDepartmentsAndOgm() {
    try {
      return await this.organizationService.getAllDepartmentsAndOgm();
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }
}
