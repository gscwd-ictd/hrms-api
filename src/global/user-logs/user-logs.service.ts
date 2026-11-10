import { BaseEntityCrudService } from './../../core/base-entity/base-entity.service';
import { Injectable, HttpException } from '@nestjs/common';
import { UserLogs } from './data/user-logs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLogsDTO } from './data/user-logs.dto';
import { EmployeesService } from 'src/core/employees/employees.service';
import { describeUserLog } from './utils/user-log-description.util';

/** user_id_fk of actions done by the super user (no employee record) */
export const SUPER_USER_LOG_ID = 'super-user';

const USER_NAME_SQL = `CASE WHEN user_id_fk = '${SUPER_USER_LOG_ID}' THEN 'Super User' ELSE COALESCE(get_employee_fullname(user_id_fk), CONCAT('Unknown user (', user_id_fk, ')')) END`;

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

  /**
   * System logs between two dates (YYYY-MM-DD, inclusive), newest first. Default: the last 30 days.
   * action = what the user did, in plain words (e.g. "Updated a plantilla position").
   */
  async getAllLogs(dateFrom?: string, dateTo?: string) {
    const isDate = (d?: string) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
    const today = new Date();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const to = isDate(dateTo) ? dateTo : fmt(today);
    const from = isDate(dateFrom) ? dateFrom : fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30));
    try {
      const rows = (await this.entityRepository.query(
        `
        SELECT
          _id,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') dateLogged,
          ${USER_NAME_SQL} userFullName,
          method, route, body
        FROM user_logs
        WHERE user_id_fk IS NOT NULL AND user_id_fk <> ''
          AND created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
        ORDER BY created_at DESC;
      `,
        [from, to],
      )) as { _id: string; dateLogged: string; userFullName: string; method: string; route: string; body: string }[];
      return rows.map(({ method, route, body, ...row }) => ({ ...row, action: describeUserLog(method, route, body) }));
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
          ${USER_NAME_SQL} userFullName, 
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
      const log = (
        await this.entityRepository.query(
          `
      SELECT 
        _id, 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') dateLogged,
        ${USER_NAME_SQL} userFullName, 
        method,
        route, 
        body 
      FROM user_logs WHERE _id=?;
    `,
          [_id],
        )
      )[0];
      return log ? { ...log, action: describeUserLog(log.method, log.route, log.body) } : log;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
