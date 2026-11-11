/**
 * Casual / Job Order registration helpers (HR 2026-11-11).
 *  - Employee No.: <current year>-<sequence>, the sequence is +1 from the latest employee number of that year,
 *    3 digits (2026-001, 2026-002, ... 2026-1000 after 999).
 *  - Default Employee Portal password: '@' + first name + employee no. (e.g. @Juan2026-042).
 */

export type CasualJobOrderNature = 'casual' | 'job order';

export type RegisterCasualJobOrderDto = {
  natureOfAppointment: CasualJobOrderNature;
  /** Casual only: an existing Job Order employee to appoint as Casual (the personal details below are then not needed) */
  existingEmployeeId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nameExtension?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  birthday: string; // YYYY-MM-DD
  sex: 'Male' | 'Female';
  civilStatus?: string;
  phoneNumber: string;
  email: string;
  dailyRate?: number | string;
  isPerPieceRate?: boolean;
  positionTitle: string;
  /** office / department / division _id (from GET organization/dropdown) */
  orgId: string;
  /** date the appointment takes effect (YYYY-MM-DD); default today */
  effectivityDate?: string;
};

/** next employee number of the year from the latest one (e.g. '2026-041' -> '2026-042'; none yet -> '2026-001') */
export function nextCompanyId(year: number | string, latestCompanyId: string | null | undefined): string {
  const match = /^\d{4}-(\d+)$/.exec(latestCompanyId ?? '');
  const next = (match ? parseInt(match[1], 10) : 0) + 1;
  return `${year}-${String(next).padStart(3, '0')}`;
}

export function defaultPortalPassword(firstName: string, companyId: string): string {
  return `@${(firstName ?? '').trim()}${companyId}`;
}

/** returns the first validation problem, or null */
export function validateRegistration(dto: RegisterCasualJobOrderDto): string | null {
  const text = (v: unknown) => typeof v === 'string' && v.trim() !== '';
  if (dto?.natureOfAppointment !== 'casual' && dto?.natureOfAppointment !== 'job order') return 'Nature of appointment must be Casual or Job Order.';
  if (!text(dto.positionTitle)) return 'Position title is required.';
  if (!text(dto.orgId)) return 'Select the office, department or division of the position.';
  if (dto.effectivityDate && !/^\d{4}-\d{2}-\d{2}$/.test(dto.effectivityDate)) return 'Effectivity date is not valid.';
  if (text(dto.existingEmployeeId)) {
    return dto.natureOfAppointment === 'casual' ? null : 'Only a Casual appointment can be given to an existing Job Order employee.';
  }
  if (!text(dto.firstName) || !text(dto.lastName)) return 'First name and last name are required.';
  if (!text(dto.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) return 'A valid email is required.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dto.birthday ?? '')) return 'Birthday is required.';
  if (dto.sex !== 'Male' && dto.sex !== 'Female') return 'Sex is required.';
  if (!text(dto.phoneNumber)) return 'Phone number is required.';
  if (dto.natureOfAppointment === 'job order' && !(Number(dto.dailyRate) > 0)) return 'Daily rate is required for Job Order.';
  return null;
}

/** employee_monitoring.leave_benefits ids */
export const LEAVE_BENEFIT = {
  FORCED: '1c6bc9b6-af14-468d-88ad-5dfc01869608',
  SICK: '7eed9b4c-22b3-432a-a238-01102b2a0ea5',
  VACATION: '8ea199f1-73b8-4279-a5c8-9952a51a4b8c',
  SPECIAL_PRIVILEGE: 'cb91fdda-9f65-4132-ae80-c61bda9abe31',
  WELLNESS: '855bca60-9d1b-40ed-bc73-582f0a19ffae',
};

/** 'Beginning Balance' of 0, dated January 1 of the year, for these 4 leave types */
export const BEGINNING_BALANCE_LEAVES = [LEAVE_BENEFIT.FORCED, LEAVE_BENEFIT.SICK, LEAVE_BENEFIT.VACATION, LEAVE_BENEFIT.SPECIAL_PRIVILEGE];

/** months of service left in the calendar year, counting the month of the effectivity date (Sep 1 -> 4) */
export function remainingMonthsInYear(effectivityDate: string): number {
  const month = parseInt(effectivityDate.slice(5, 7), 10); // 1..12
  return 13 - month;
}

/** Wellness Leave by months of service left in the year: 10-11 -> 4, 7-9 -> 3, 4-6 -> 2, 1-3 -> 1 (12 -> 5, the full year) */
export function initialWellnessCredits(months: number): number {
  if (months >= 12) return 5;
  if (months >= 10) return 4;
  if (months >= 7) return 3;
  if (months >= 4) return 2;
  return months >= 1 ? 1 : 0;
}

/**
 * Leave credits of a new Casual employee (HR 2026-11-11):
 * Beginning Balance 0 (Jan 1) for FL / SL / VL / SPL, then initial credits on the effectivity date:
 * FL 5, VL 0, SL 0, SPL 3, Wellness by months of service left in the year.
 */
export function initialCasualLeaveCredits(effectivityDate: string) {
  const year = effectivityDate.slice(0, 4);
  return [
    ...BEGINNING_BALANCE_LEAVES.map((leaveBenefitsId) => ({ leaveBenefitsId, creditDate: `${year}-01-01`, creditValue: 0, remarks: 'Beginning Balance' })),
    { leaveBenefitsId: LEAVE_BENEFIT.FORCED, creditDate: effectivityDate, creditValue: 5, remarks: null },
    { leaveBenefitsId: LEAVE_BENEFIT.VACATION, creditDate: effectivityDate, creditValue: 0, remarks: null },
    { leaveBenefitsId: LEAVE_BENEFIT.SICK, creditDate: effectivityDate, creditValue: 0, remarks: null },
    { leaveBenefitsId: LEAVE_BENEFIT.SPECIAL_PRIVILEGE, creditDate: effectivityDate, creditValue: 3, remarks: null },
    {
      leaveBenefitsId: LEAVE_BENEFIT.WELLNESS,
      creditDate: effectivityDate,
      creditValue: initialWellnessCredits(remainingMonthsInYear(effectivityDate)),
      remarks: null,
    },
  ];
}
