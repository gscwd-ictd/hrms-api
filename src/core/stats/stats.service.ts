import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';
import { ClientProxy } from '@nestjs/microservices';
import { PrfTrailService } from '../document-tracking/prf/trail/prf-trail.service';
import { getManager } from 'typeorm';
import { OrganizationService } from '../organization/organization.service';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class StatsService {
  constructor(
    @Inject(MicroserviceType.AUTHN) private readonly clientAuthn: ClientProxy,
    private readonly prfTrailService: PrfTrailService,
    private readonly organizationService: OrganizationService,
    private readonly employeesService: EmployeesService,
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
        'select nature_of_appointment as appointment, count (employee_id_fk) AS employeesTotal from plantilla_positions where nature_of_appointment != ? group by nature_of_appointment ',
        ['board of directors'],
      );

      const labels = count.map((items) => items.appointment);
      const employeesTotal = count.map((items) => parseInt(items.employeesTotal));

      return {
        labels: labels,
        data: employeesTotal,
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  async countPersonnelPerDepartment() {
    try {
      const organization = await this.organizationService.getAllDepartmentsAndOgm();

      const result = await Promise.all(
        organization.map(async (department) => {
          const employees = await this.employeesService.getEmployeesByOrgId(department._id);

          const genderCounts = { male: 0, female: 0 };

          await Promise.all(
            employees.map(async (employee) => {
              const genderResponse = await lastValueFrom(this.clientAuthn.send({ msg: 'find_employee_gender_by_employee_id' }, employee.value));

              if (genderResponse && genderResponse.sex) {
                if (genderResponse.sex === 'Male') {
                  genderCounts.male++;
                } else if (genderResponse.sex === 'Female') {
                  genderCounts.female++;
                }
              }
            }),
          );

          return {
            label: department.code,
            gender: genderCounts,
          };
        }),
      );

      const labels = result.map((item) => item.label);
      const maleData = result.map((item) => item.gender.male);
      const femaleData = result.map((item) => item.gender.female);
      return {
        labels: labels,
        datasets: [
          {
            label: 'Male',
            data: maleData,
          },
          {
            label: 'Female',
            data: femaleData,
          },
        ],
      };
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async countPersonnelByAgeBracket() {
    try {
      return await lastValueFrom(this.clientAuthn.send({ msg: 'count_personnel_by_age_bracket' }, ''));
    } catch (error) {
      Logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
