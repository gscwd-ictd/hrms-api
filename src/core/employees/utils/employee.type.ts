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
