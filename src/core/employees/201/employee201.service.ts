import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { Employee201 } from './entities/employee201.entity';
import { Repository } from 'typeorm';
import { Employee201Dto, UpdateEmployee201Dto } from './dtos/employee201.dto';

@Injectable()
export class Employee201Service extends BaseEntityCrudService<Employee201> {
  constructor(
    @InjectRepository(Employee201)
    private readonly employee201Repository: Repository<Employee201>,
  ) {
    super(employee201Repository);
  }

  async getEmployee201(employeeId: string) {
    const serviceRecord = await this.employee201Repository.query(
      `SELECT 
          _id,
    	    DATE_FORMAT(date_from,'%Y-%m-%d') dateFrom,
          DATE_FORMAT(date_to,'%Y-%m-%d') dateTo,
          position_title positionTitle, 
          IF(monthly_salary IS NULL, ROUND((get_salary_grade_amount(salary_grade_id)*100)/100,2), monthly_salary) monthlySalary, 
          nature_of_appointment natureOfAppointment, 
          IF(nature_of_appointment = 'job order', false, true) govService
      FROM employee_201 WHERE employee_id_fk = ? ORDER BY date_from DESC;`,
      [employeeId],
    );
    if (serviceRecord.length > 0) {
      const latestRecord = serviceRecord[0];
      const status = latestRecord.dateTo !== null ? 'inactive' : 'active';

      return {
        status,
        serviceRecord,
      };
    }
    return [];
  }

  async addEmployee201Record(employee201Dto: Employee201Dto) {
    try {
      return await this.saveEntity(employee201Dto);
    } catch (error) {
      throw new HttpException(error, error.status);
    }
  }

  async updateEmployee201Record(updateEmployee201Record: UpdateEmployee201Dto) {
    const result = await this.updateEntity(updateEmployee201Record);
    return result;
  }

  async deleteEmployee201Record(_id: string) {
    return await this.removeEntity(_id);
  }
}
