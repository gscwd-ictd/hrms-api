import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { CreateEmployeeTagsDto } from './data/employee-tags.dto';
import { EmployeeTags } from './data/employee-tags.entity';

@Injectable()
export class EmployeeTagsService extends BaseEntityCrudService<EmployeeTags> {
  constructor(@InjectRepository(EmployeeTags) private readonly employeeTagsRepository: Repository<EmployeeTags>) {
    super(employeeTagsRepository);
  }

  async addEmployeeTags(employeeTagsDto: CreateEmployeeTagsDto) {
    try {
      const { employees, tags } = employeeTagsDto;
      const addResult = await getManager().transaction(async (entityManager) => {
        const addEmployeeTagsResult = await Promise.all(
          employees.map(async (employee) => {
            const addTagsResult = await Promise.all(
              tags.map(async (tag) => {
                return await entityManager.getRepository(EmployeeTags).save({ employeeId: employee, tagId: tag });
              }),
            );
            return { employee, tags };
          }),
        );
        return addEmployeeTagsResult;
      });

      return addResult;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getSupervisorByEmployeeTags(data: { tagIds: [] }) {
    try {
      //1. GET EMPLOYEE NAMES WITH TAGS
      const employeesWithTags = await this.entityRepository.query(
        ` SELECT distinct 
        get_employee_assignment_or_oic(emp._id) assignmentName,
        get_employee_position_or_oic(emp._id) positionTitle,
        emp._id employeeId,
        get_employee_fullname2(emp._id) employeeFullName, 
        get_employee_supervisor(emp._id) supervisorId, 
        get_employee_fullname2(get_employee_supervisor(emp._id)) 
        supervisorName FROM employees emp 
       INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?);
        `,
        [data.tagIds],
      );

      return employeesWithTags;
    } catch (error) {}
  }

  async getTagsByEmployeeId(employeeId: string) {
    try {
      const tags = await this.entityRepository.find({ where: { employeeId }, select: ['tagId'], order: { tagId: 'ASC' } });
      const arrayOfTags = await Promise.all(
        tags.map(async (tag) => {
          return tag.tagId;
        }),
      );
      return arrayOfTags;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEmployeeByTagId(tagId: string) {
    //return await this.
    const employeeDetails = await this.entityRepository.query(
      `
        SELECT 
          emp._id employeeId, 
          get_employee_fullname2(emp._id) employeeName, 
          get_employee_position_or_oic(emp._id) position, 
          get_employee_assignment_or_oic(emp._id) assignment
        FROM employee_tags et 
          INNER JOIN employees emp ON emp._id = et.employee_id_fk 
        WHERE et.tag_id_fk = ?
    `,
      [tagId],
    );
    console.log(employeeDetails);
    return employeeDetails;
  }
}
