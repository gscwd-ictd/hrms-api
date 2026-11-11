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
