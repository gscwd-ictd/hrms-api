import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { BaseEntityCrudService } from '../base-entity/base-entity.service';
import { CreateEmployeeTagsDto, DeleteEmployeeTagDto } from './data/employee-tags.dto';
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

  async getSupervisorByEmployeeTagsV2(tagIds: string[]) {
    try {
      //1. GET EMPLOYEE NAMES WITH TAGS
      const supervisors = await this.entityRepository.query(
        ` SELECT DISTINCT supervisorId,supervisorName FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo;
        `,
        [tagIds],
      );
      //console.log(employeesWithTags);
      const employees = await Promise.all(
        supervisors.map(async (supervisor) => {
          const { supervisorId, supervisorName } = supervisor;
          const employees = await this.entityRepository.query(
            `
         SELECT DISTINCT employeeId,employeeFullName name,positionTitle FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo WHERE supervisorInfo.supervisorId = ?;
         `,
            [tagIds, supervisorId],
          );

          return { supervisor: { supervisorId: supervisorId, name: supervisorName }, employees };
        }),
      );
      console.log(employees);
      return employees;

      //return employeesWithTags;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getSupervisorByEmployeeTags(tagId: string) {
    try {
      //1. GET EMPLOYEE NAMES WITH TAGS
      const supervisors = await this.entityRepository.query(
        ` SELECT DISTINCT supervisorId,supervisorName FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo;
        `,
        [tagId],
      );
      //console.log(employeesWithTags);
      const employees = await Promise.all(
        supervisors.map(async (supervisor) => {
          const { supervisorId, supervisorName } = supervisor;
          const employees = await this.entityRepository.query(
            `
         SELECT DISTINCT employeeId,employeeFullName name,positionTitle FROM (SELECT distinct 
          get_employee_assignment_or_oic(emp._id) assignmentName,
          get_employee_position_or_oic(emp._id) positionTitle,
          emp._id employeeId,
          get_employee_fullname2(emp._id) employeeFullName, 
          get_employee_supervisor(emp._id) supervisorId, 
          get_employee_fullname2(get_employee_supervisor(emp._id)) supervisorName FROM employees emp 
         INNER JOIN employee_tags et ON et.employee_id_fk = emp._id WHERE et.tag_id_fk IN (?)) supervisorInfo WHERE supervisorInfo.supervisorId = ?;
         `,
            [tagId, supervisorId],
          );
          return { supervisor: { supervisorId, name: supervisorName }, employees };
        }),
      );
      console.log(employees);
      return employees;

      //return employeesWithTags;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getTagsByEmployeeId(employeeId: string) {
    try {
      const tags = await this.entityRepository.find({ where: { employeeId }, select: ['tagId'], order: { createdAt: 'ASC' } });
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

  async deleteEmployeeTag(deleteEmployeeTagsDto: DeleteEmployeeTagDto) {
    try {
      console.log('delete here');
      console.log(deleteEmployeeTagsDto);
      const { employeeId, tagId } = deleteEmployeeTagsDto;
      const deleteResult = await this.entityRepository.query(`DELETE FROM employee_tags WHERE tag_id_fk =?  AND employee_id_fk=?`, [tagId, employeeId]);
      if (deleteResult.affectedRows > 0) return deleteEmployeeTagsDto;
    } catch (error) {
      console.log(error);
      throw new RpcException(error);
    }
  }

  async getEmployeeByTagId(tagId: string) {
    //return await this.
    const employeeDetails = await this.entityRepository.query(
      `
        SELECT 
          emp._id employeeId, 
          get_employee_fullname2(emp._id) fullName, 
          get_employee_position_or_oic(emp._id) positionTitle
        FROM employee_tags et 
          INNER JOIN employees emp ON emp._id = et.employee_id_fk 
        WHERE et.tag_id_fk = ? ORDER BY et.created_at ASC
    `,
      [tagId],
    );
    console.log(employeeDetails);
    return employeeDetails;
  }
}
