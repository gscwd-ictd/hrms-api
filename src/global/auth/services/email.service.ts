import { ExternalApplicantsDTO } from './../../../core/vacant-position-posting/sub-modules/applicants/external-applicants/data/dtos/external-applicants.dto';
import { EmployeeEmailPayload } from './../../../core/employees/utils/employee.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceHelper } from 'src/global/utils/helper/microservice.helper';
import { MicroserviceType } from 'src/global/utils/enums/microservice-type.enum';

@Injectable()
export class EmailService extends MicroserviceHelper {
  constructor(@Inject(MicroserviceType.EMAIL) public client: ClientProxy) {
    super(client);
  }

  async sendEmail(email: string, employeeId: string, salaryGrade: number, details: EmployeeEmailPayload) {
    return await this.sendRequest(
      { msg: 'email.send.registration' },
      {
        from: '"HRD" <hrd@gscwd.com>',
        to: email,
        employeeId,
        details,
        subject: 'GSCWD Employee Portal Registration',
        templateDir: '/templates/employee-portal/registration.hbs',
      },
    );
  }

  async sendEmailForApplicant(email: string, details: ExternalApplicantsDTO, vppId: string) {
    console.log(email);
    console.log(details);
    return await this.sendRequest(
      { msg: 'email.applicant.send.message' },
      {
        from: '"HRD" <hrd@gscwd.com>',
        to: email,
        details,
        subject: 'GSCWD Job Portal',
        templateDir: '/templates/hrms/applicant-login.hbs',
        vppId,
      },
    );
  }
}
