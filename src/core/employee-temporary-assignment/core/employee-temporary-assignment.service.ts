import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEmployeeTemporaryAssignmentDto, EmployeeTemporaryAssignment, UpdateEmployeeTemporaryAssignmentDto } from '../data';
import { Repository } from 'typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { EmployeeTemporaryAssignmentStatus } from 'src/global/utils/enums/employee-temporary-assignment.enum';

@Injectable()
export class EmployeeTemporaryAssignmentService extends BaseEntityCrudService<EmployeeTemporaryAssignment> {
  constructor(
    @InjectRepository(EmployeeTemporaryAssignment)
    private readonly employeeTemporaryAssignmentRepository: Repository<EmployeeTemporaryAssignment>,
  ) {
    super(employeeTemporaryAssignmentRepository);
  }

  /* find all employee temporary assignment */
  async findAllEmployeeTemporaryAssignment() {
    try {
      return await this.employeeTemporaryAssignmentRepository
        .createQueryBuilder()
        .select('created_at', 'createAt')
        .addSelect('updated_at', 'updatedAt')
        .addSelect('_id', 'id')
        .addSelect('employee_id_fk', 'employeeId')
        .addSelect('get_employee_fullname(employee_id_fk)', 'fullName')
        .addSelect('organization_id_fk', 'organizationId')
        .addSelect('get_org_name_by_org_id(organization_id_fk)', 'organizationName')
        .addSelect('status')
        .getRawMany();
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /* insert employee temporary assignment */
  async createEmployeeTemporaryAssignment(data: CreateEmployeeTemporaryAssignmentDto) {
    try {
      const { employeeId, ...rest } = data;
      const temporaryAssignment = await this.employeeTemporaryAssignmentRepository
        .createQueryBuilder()
        .insert()
        .values({
          employee: {
            _id: employeeId,
          },
          ...rest,
        })
        .execute();

      return await this.findEmployeeTemporaryAssignmentById(temporaryAssignment.generatedMaps[0]._id);
    } catch (error) {
      Logger.error(error.errno);
      if (error.errno === 1062) throw new HttpException('Resourcce already exist', HttpStatus.CONFLICT);
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  /* find employee temporary assignment by id */
  async findEmployeeTemporaryAssignmentById(id: string) {
    try {
      const temporaryAssignment = await this.employeeTemporaryAssignmentRepository
        .createQueryBuilder()
        .select('created_at', 'createAt')
        .addSelect('updated_at', 'updatedAt')
        .addSelect('_id', 'id')
        .addSelect('employee_id_fk', 'employeeId')
        .addSelect('get_employee_fullname(employee_id_fk)', 'fullName')
        .addSelect('organization_id_fk', 'organizationId')
        .addSelect('get_org_name_by_org_id(organization_id_fk)', 'organizationName')
        .addSelect('status')
        .where('_id = :id', { id: id })
        .getRawOne();

      if (temporaryAssignment === undefined) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      return temporaryAssignment;
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  /* update employee temporary assignment by id */
  async updateEmployeeTemporaryAssignmentById(id: string, data: UpdateEmployeeTemporaryAssignmentDto) {
    try {
      const { employeeId, ...rest } = data;

      const updateTemporaryAssignment = await this.employeeTemporaryAssignmentRepository
        .createQueryBuilder()
        .update()
        .set({
          employee: {
            _id: employeeId,
          },
          ...rest,
        })
        .where('_id = :id', { id: id })
        .execute();

      if (updateTemporaryAssignment.affected < 1) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      return updateTemporaryAssignment;
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  /* remove employee temporary assignment by id */
  async deleteEmployeTemporaryAssignmentById(id: string) {
    try {
      const updateTemporaryAssignment = await this.employeeTemporaryAssignmentRepository
        .createQueryBuilder()
        .update()
        .set({ status: EmployeeTemporaryAssignmentStatus.INACTIVE })
        .where('_id = :id', { id: id })
        .execute();

      if (updateTemporaryAssignment.affected < 1) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

      return await this.employeeTemporaryAssignmentRepository.createQueryBuilder().softDelete().where('_id = :id', { id: id }).execute();
    } catch (error) {
      Logger.error(error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Bad requet', HttpStatus.BAD_REQUEST);
    }
  }

  /* find all assignable employee */
  async findAllAssignableEmployee() {
    try {
      const employeeList = (await this.employeeTemporaryAssignmentRepository.query(`SELECT 
      get_employee_fullname(emp._id) label,
      emp._id value FROM employees emp 
      INNER JOIN plantilla_positions pp ON pp.employee_id_fk = emp._id
      INNER JOIN salary_grade sg ON sg._id = pp.salary_grade_id_fk  
      WHERE pp.nature_of_appointment = 'casual' OR pp.nature_of_appointment = 'permanent' 
      AND sg.salary_grade <= 27
      ORDER BY get_employee_fullname(emp._id) ASC;`)) as { label: string; value: string }[];

      const employeeTemporaryAssignmentList = await this.employeeTemporaryAssignmentRepository.createQueryBuilder().select('employee_id_fk', 'employeeId').getRawMany();

      const employeeTemporaryAssignmentId = employeeTemporaryAssignmentList.map((items) => items.employeeId);

      return employeeList
        .filter((items) => !employeeTemporaryAssignmentId.includes(items.value))
        .map((items) => ({
          label: items.label,
          value: items.value,
        }));
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
