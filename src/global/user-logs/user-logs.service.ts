import { BaseEntityCrudService } from './../../core/base-entity/base-entity.service';
import { Injectable, HttpException } from '@nestjs/common';
import { UserLogs } from './data/user-logs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLogsDTO } from './data/user-logs.dto';
import { EmployeesService } from 'src/core/employees/employees.service';

@Injectable()
export class UserLogsService extends BaseEntityCrudService<UserLogs> {
  constructor(@InjectRepository(UserLogs) private readonly userLogsRepository: Repository<UserLogs>, private readonly employeeService: EmployeesService) {
    super(userLogsRepository);
  }

  async addLogs(userLogDTO: UserLogsDTO) {
    try {
      return await this.saveEntity(userLogDTO);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getLogsByYearMonth(yearMonth: string) {
    try {
      const logs = await this.entityRepository.createQueryBuilder().where(`DATE_FORMAT(created_at, '%Y-%m' ) = :yearMonth`, { yearMonth }).orderBy('created_at', 'DESC').getMany();
      const logsDetailed = await Promise.all(
        logs.map(async (log) => {
          const { body, _id, method, route, userId, createdAt } = log;
          let userFullName = 'Super User';
          if (userId !== '' || userId === null) userFullName = (await this.employeeService.getBasicEmployeeDetailsByEmployeeId(userId)).employeeFullName;
          return { _id, dateLogged: createdAt, userFullName };
        }),
      );
      return logsDetailed;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getAllLogs() {
    try {
      return await this.entityRepository.query(`
        SELECT 
          _id, 
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') dateLogged, 
          if(user_id_fk <> '',get_employee_fullname(user_id_fk), 'Super User') userFullName 
        FROM user_logs ORDER BY created_at DESC;
      `);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getAllDetailedLogs() {
    try {
      return await this.entityRepository.query(`
        SELECT 
          _id, 
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') dateLogged,
          if(user_id_fk <> '',get_employee_fullname(user_id_fk), 'Super User') userFullName, 
          method,
          route, 
          body 
        FROM user_logs ORDER BY created_at DESC;
      `);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getLogById(_id: string) {
    try {
      return (
        await this.entityRepository.query(
          `
      SELECT 
        _id, 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') dateLogged,
        if(user_id_fk <> '',get_employee_fullname(user_id_fk), 'Super User') userFullName, 
        method,
        route, 
        body 
      FROM user_logs WHERE _id=?;
    `,
          [_id],
        )
      )[0];
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
