import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { ClientProxy } from '@nestjs/microservices';
import { PlantillaPositionsService } from '../plantilla-positions/plantilla-positions.service';
import { PrfTrailService } from '../document-tracking/prf/trail/prf-trail.service';
import { getManager } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @Inject(MicroserviceType.AUTHN) private readonly clientAuthn: ClientProxy,
    private readonly plantillaPositionsService: PlantillaPositionsService,
    private readonly prfTrailService: PrfTrailService,
  ) {}

  async countEmployees() {
    try {
      const count = (await getManager().query('select count(employee_id_fk) as employeesTotal from plantilla_positions'))[0];
      return { employeesTotal: parseInt(count.employeesTotal) };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async countApprovedPrf() {
    try {
      const count = await this.prfTrailService.countApprovedPrf();
      return { approvedPrf: count };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async countApplicants() {
    try {
      const currentYear = new Date().getFullYear();
      const count = (
        await getManager().query(
          'select count(applicantId) as applicantCount from posting_applicants_view left join vacant_position_posting on posting_applicants_view.vppId  = vacant_position_posting._id where year(posting_date) = ?',
          [currentYear],
        )
      )[0];
      return {
        count: parseInt(count.applicantCount),
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findCurrentBirthdays() {
    try {
      return await lastValueFrom(this.clientAuthn.send({ msg: 'get_employee_birthdays_for_the_current_month' }, ''));
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async countEmployeesByNatureOfAppointment() {
    try {
      const count = await getManager().query(
        'select nature_of_appointment as appointment, count (employee_id_fk) AS employeesTotal from plantilla_positions group by nature_of_appointment',
      );

      const labels = count.map((items) => items.appointment);
      const employeesTotal = count.map((items) => parseInt(items.employeesTotal));

      return {
        labels: labels,
        datasets: [
          {
            label: '# of Employees',
            data: employeesTotal,
          },
        ],
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }
}
