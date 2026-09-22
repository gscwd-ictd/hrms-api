import { HttpException, Injectable } from '@nestjs/common';
import { BaseEntityCrudService } from 'src/core/base-entity/base-entity.service';
import { NosiNosa } from './data/entities/nosi-nosa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NosiNosaViewService } from './nosi-nosa-view.service';
import { ServiceRecordDto } from './data/dto/nosi-nosa.dto';

@Injectable()
export class NosiNosaService extends BaseEntityCrudService<NosiNosa> {
  constructor(
    @InjectRepository(NosiNosa)
    private readonly nosiNosaRepository: Repository<NosiNosa>,
    private readonly nosiNosaViewService: NosiNosaViewService,
  ) {
    super(nosiNosaRepository);
  }

  async getForNosiList() {
    return await this.entityRepository.query(`
      SELECT 
          _id,
          employeeId,
          employeeName,
          positionTitle, 
          DATE_FORMAT(effectivityDate, '%Y-%m-%d') effectivityDate, 
          CONCAT(actualSalaryGrade,'-',actualStepIncrement) actualSalaryGrade,
          CONCAT(adjustedSalaryGrade,'-',adjustedStepIncrement) adjustedSalaryGrade,
          status
      FROM ${process.env.HRMS_DB_NAME}nosi_nosa_view 
    `);
  }

  async getNosiNosaLedgerByEmployeeId(employeeId: string) {
    return await this.entityRepository.query(
      `
        SELECT 
          _id,
          DATE_FORMAT(effectivityDate, '%Y-%m-%d') dateFrom, 
          DATE_FORMAT(DATE_SUB(
              LEAD(effectivityDate) OVER (ORDER BY effectivityDate ASC), 
              INTERVAL 1 DAY 
          ),'%Y-%m-%d') AS dateTo,
          positionTitle, 
          adjustedAmount, 
          CONCAT(adjustedSalaryGrade,'-',adjustedStepIncrement) salaryGrade,
          get_nature_of_appointment(positionId) appointment, 
          status,
          if(get_nature_of_appointment(positionId) = 'permanent' OR get_nature_of_appointment(positionId) = 'casual', 'Yes', 'No' ) isGovernmentService
        FROM ${process.env.HRMS_DB_NAME}nosi_nosa_view
        WHERE employeeId = ? 
        ORDER BY effectivityDate DESC;
      `,
      [employeeId],
    );
  }

  async addServiceRecord(serviceRecordDto: ServiceRecordDto) {
    try {
      const { actualSalaryGrade, actualSgYear, actualStepIncrement, adjustedSalaryGrade, adjustedSgYear, adjustedStepIncrement, effectivityDate, employeeId, positionId, status } =
        serviceRecordDto;

      const result = await this.entityRepository.query(`CALL sp_add_initial_nosi_nosa(?,?,?,?,?,?,?,?,?,?);`, [
        employeeId,
        positionId,
        effectivityDate,
        actualSalaryGrade,
        actualStepIncrement,
        actualSgYear,
        adjustedSalaryGrade,
        adjustedStepIncrement,
        adjustedSgYear,
        status,
      ]);

      return result[0][0];
    } catch (error) {
      console.log(error);
      throw new HttpException(error.status, error.message);
    }
  }
}
