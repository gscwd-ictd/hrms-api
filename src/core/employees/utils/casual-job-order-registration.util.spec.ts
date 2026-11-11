import { defaultPortalPassword, initialCasualLeaveCredits, initialWellnessCredits, nextCompanyId, remainingMonthsInYear, validateRegistration } from './casual-job-order-registration.util';

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
    scheduleId: 's1',
    scheduleDateFrom: '2026-11-16',
    scheduleDateTo: '2026-12-31',
    restDays: [0, 6],
  };
  const sched = { scheduleId: 's1', scheduleDateFrom: '2026-11-16', scheduleDateTo: '2026-12-31', restDays: [0, 6] };
  it('valid', () => expect(validateRegistration(ok)).toBeNull());
  it('JO needs a daily rate', () => expect(validateRegistration({ ...ok, dailyRate: '' })).toMatch(/Daily rate/));
  it('casual does not need a daily rate', () =>
    expect(validateRegistration({ ...ok, natureOfAppointment: 'casual', dailyRate: '', salaryGrade: 6, stepIncrement: 1 })).toBeNull());
  it('casual needs salary grade and step', () =>
    expect(validateRegistration({ ...ok, natureOfAppointment: 'casual', dailyRate: '' })).toMatch(/Salary grade/));
  it('existing JO employee to casual: only position and designation needed', () =>
    expect(validateRegistration({ natureOfAppointment: 'casual', existingEmployeeId: 'e1', positionTitle: 'Clerk', orgId: 'o1', salaryGrade: 6, stepIncrement: 1, ...sched } as never)).toBeNull());
  it('existing employee only for casual', () =>
    expect(validateRegistration({ ...ok, existingEmployeeId: 'e1' })).toMatch(/Casual/));
  it('schedule required', () => expect(validateRegistration({ ...ok, scheduleId: '' })).toMatch(/schedule/));
  it('rest days required', () => expect(validateRegistration({ ...ok, restDays: [] })).toMatch(/rest days/));
  it('schedule range order', () => expect(validateRegistration({ ...ok, scheduleDateTo: '2026-11-01' })).toMatch(/on or before/));
  it('position title required', () => expect(validateRegistration({ ...ok, positionTitle: ' ' })).toMatch(/Position/));
});

describe('initial Casual leave credits', () => {
  it('Wellness by months left in the year', () => {
    expect(initialWellnessCredits(remainingMonthsInYear('2026-09-01'))).toBe(2); // Sep-Dec = 4
    expect(initialWellnessCredits(remainingMonthsInYear('2026-03-16'))).toBe(4); // 10
    expect(initialWellnessCredits(remainingMonthsInYear('2026-06-01'))).toBe(3); // 7
    expect(initialWellnessCredits(remainingMonthsInYear('2026-11-11'))).toBe(1); // 2
  });
  it('rows: 4 beginning balances (Jan 1) + FL 5, VL 0, SL 0, SPL 3, WL on the effectivity date', () => {
    const rows = initialCasualLeaveCredits('2026-11-16');
    expect(rows.filter((r) => r.remarks === 'Beginning Balance' && r.creditDate === '2026-01-01' && r.creditValue === 0)).toHaveLength(4);
    expect(rows.filter((r) => r.creditDate === '2026-11-16').map((r) => r.creditValue)).toEqual([5, 0, 0, 3, 1]);
  });
});
