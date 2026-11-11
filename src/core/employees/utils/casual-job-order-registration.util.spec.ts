import { defaultPortalPassword, nextCompanyId, validateRegistration } from './casual-job-order-registration.util';

describe('nextCompanyId', () => {
  it('+1 from the latest of the year', () => expect(nextCompanyId(2026, '2026-041')).toBe('2026-042'));
  it('first of the year', () => expect(nextCompanyId(2027, null)).toBe('2027-001'));
  it('past 999', () => expect(nextCompanyId(2026, '2026-999')).toBe('2026-1000'));
});

describe('defaultPortalPassword', () => {
  it('@ + first name + employee no.', () => expect(defaultPortalPassword('Juan', '2026-042')).toBe('@Juan2026-042'));
});

describe('validateRegistration', () => {
  const ok = {
    natureOfAppointment: 'job order' as const,
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    birthday: '1990-01-01',
    sex: 'Male' as const,
    phoneNumber: '09171234567',
    email: 'juan@gscwd.com',
    dailyRate: 708.45,
    positionTitle: 'Meter Reader',
    orgId: 'x',
  };
  it('valid', () => expect(validateRegistration(ok)).toBeNull());
  it('JO needs a daily rate', () => expect(validateRegistration({ ...ok, dailyRate: '' })).toMatch(/Daily rate/));
  it('casual does not', () => expect(validateRegistration({ ...ok, natureOfAppointment: 'casual', dailyRate: '' })).toBeNull());
  it('existing JO employee to casual: only position and designation needed', () =>
    expect(validateRegistration({ natureOfAppointment: 'casual', existingEmployeeId: 'e1', positionTitle: 'Clerk', orgId: 'o1' } as never)).toBeNull());
  it('existing employee only for casual', () =>
    expect(validateRegistration({ ...ok, existingEmployeeId: 'e1' })).toMatch(/Casual/));
  it('position title required', () => expect(validateRegistration({ ...ok, positionTitle: ' ' })).toMatch(/Position/));
});
