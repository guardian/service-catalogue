import { isWithinSlaTime } from './findings';

const MOCK_TODAY = new Date('2024-01-10');
const MOCK_ONE_DAY_AGO = new Date('2024-01-09');
const MOCK_TWO_DAYS_AGO = new Date('2024-01-08');
const MOCK_ONE_WEEK_AGO = new Date('2024-01-03');

describe('FBSP SLA window', () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(MOCK_TODAY);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('Returns true if a critical finding was first observed within a day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'CRITICAL';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(true);
	});

	it('Returns true if a critical finding was first observed within a day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'HIGH';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(true);
	});

	it('Returns true if a critical finding was first observed within two days', () => {
		const firstObservedAt = new Date(MOCK_TWO_DAYS_AGO);
		const severity = 'CRITICAL';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(true);
	});

	it('Returns false if a critical finding is outside the window', () => {
		const firstObservedAt = new Date(MOCK_ONE_WEEK_AGO);
		const severity = 'CRITICAL';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(false);
	});

	it('Returns false if a low finding was first observed one day ago', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'LOW';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(false);
	});

	it('Returns false if a low finding is outside the window', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'LOW';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(false);
	});
});
