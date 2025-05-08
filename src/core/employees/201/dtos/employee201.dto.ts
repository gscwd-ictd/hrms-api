import { NatureOfAppointment } from 'src/global/utils/enums/nature-of-appointment.enum';

export class Employee201Dto {
  employeeId: string;

  positionId: string;

  positionTitle: string;

  salaryGradeId: string;

  natureOfAppointment: NatureOfAppointment;

  dateFrom: Date;

  dateTo: Date;
}
