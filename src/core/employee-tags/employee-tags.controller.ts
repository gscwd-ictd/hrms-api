import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEmployeeTagsDto, DeleteEmployeeTagDto } from './data/employee-tags.dto';
import { EmployeeTagsService } from './employee-tags.service';

@Controller()
export class EmployeeTagsController {
  constructor(private readonly employeeTagsService: EmployeeTagsService) {}

  @MessagePattern('add_employee_tags')
  async addEmployeeTags(@Payload() employeeTagsDto: CreateEmployeeTagsDto) {
    return await this.employeeTagsService.addEmployeeTags(employeeTagsDto);
  }

  // @MessagePattern('get_supervisors_by_employee_tags')
  // async getSupervisorByEmployeeTags(data: { tagIds: [] }) {
  //   return await this.employeeTagsService.getSupervisorByEmployeeTags(data);
  //

  @MessagePattern('get_tags_by_employee_id')
  async getTagsByEmployeeId(@Payload() employeeId: string) {
    //console.log(await this.employeeTagsService.getTagsByEmployeeId(employeeId));
    return await this.employeeTagsService.getTagsByEmployeeId(employeeId);
  }

  @MessagePattern('get_employee_by_tag_id')
  async getEmployeeByTagId(@Payload() tagId: string) {
    return await this.employeeTagsService.getSupervisorByEmployeeTags(tagId);
    //return await this.employeeTagsService.getEmployeeByTagId(tagId);
  }

  @MessagePattern('get_employees_by_tag_ids')
  async getEmployeesByTagIds(@Payload() tagIds: string[]) {
    return await this.employeeTagsService.getSupervisorByEmployeeTagsV2(tagIds);
  }

  @MessagePattern('delete_employee_tags')
  async deleteEmployeeTag(@Payload() data: DeleteEmployeeTagDto) {
    return await this.employeeTagsService.deleteEmployeeTag(data);
  }
}
