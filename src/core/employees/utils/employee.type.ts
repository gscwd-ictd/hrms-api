import { CivilStatus, Sex } from 'src/core/vacant-position-posting/sub-modules/applicants/external-applicants/pds/utils/enums/pds.enum';

export type EmployeeEmailPayload = {
  companyId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nameExt: string;
};

export type EmployeeSchedule = {
  scheduleId: string;
  restDays: RestDays[];
};

export enum RestDays {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export type BasicEmployeeInfo = {
  employeeId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  nameExtension?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  sex: Sex;
  phoneNumber: number;
  email: string;
  dailyRate: number;
  civilStatus: CivilStatus;
  birthday: Date;
};

export enum InactiveStatus {
  RESIGNED = 'resigned',
  RETIRED = 'retired',
  TERMINATED = 'terminated',
  DECEASED = 'deceased',
  END_OF_CONTRACT = 'end_of_contract',
}
