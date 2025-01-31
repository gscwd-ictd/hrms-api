import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CheckEmployeeTagsDto, CreateEmployeeTagsDto, DeleteEmployeeTagDto } from './data/employee-tags.dto';
import { EmployeeTagsService } from './employee-tags.service';
import { MsExceptionFilter } from 'src/global/utils/filters/rpc-exception.filter';

@Controller()
export class EmployeeTagsController {
  constructor(private readonly employeeTagsService: EmployeeTagsService) { }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('add_employee_tags')
  async addEmployeeTags(@Payload() employeeTagsDto: CreateEmployeeTagsDto) {
    try {
      return await this.employeeTagsService.addEmployeeTags(employeeTagsDto);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_tags_by_employee_id')
  async getTagsByEmployeeId(@Payload() employeeId: string) {
    try {
      return await this.employeeTagsService.getTagsByEmployeeId(employeeId);
    }
    catch (error) {
      throw new RpcException(error.message);
    }

  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_employee_by_tag_id')
  async getEmployeeByTagId(@Payload() tagId: string) {
    try {
      return await this.employeeTagsService.getSupervisorByEmployeeTags(tagId);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('get_employees_by_tag_ids')
  async getEmployeesByTagIds(@Payload() tagIds: string[]) {
    try {
      return await this.employeeTagsService.getSupervisorByEmployeeTagsV2(tagIds);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseFilters(new MsExceptionFilter())
  @MessagePattern('delete_employee_tags')
  async deleteEmployeeTag(@Payload() data: DeleteEmployeeTagDto) {
    try {
      return await this.employeeTagsService.deleteEmployeeTag(data);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('count_employee_tags')
  async countEmployeeTags(@Payload() tagId: string) {
    try {
      return await this.employeeTagsService.countEmployeeTags(tagId);
    }
    catch (error) {
      throw new RpcException(error.message);
    }

  }

  @MessagePattern('check_employee_tags')
  async checkEmployeeTags(@Payload() data: CheckEmployeeTagsDto) {
    try {
      return await this.employeeTagsService.checkEmployeeTags(data);
    }
    catch (error) {
      throw new RpcException(error.message);
    }
  }
}
