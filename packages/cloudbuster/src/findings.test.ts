import { groupFindingsByAccount, isWithinSlaTime } from './findings';
import type { Finding, GroupedFindings } from './types';

const MOCK_TODAY = new Date('2024-01-10');
const MOCK_ONE_DAY_AGO = new Date('2024-01-09');
const MOCK_NEARLY_TWO_DAYS_AGO = new Date('2024-01-08').setMinutes(1);
const MOCK_ONE_WEEK_AGO = new Date('2024-01-03');

function mockFinding(awsAccountId: string, title: string): Finding {
	return {
		awsAccountId,
		title,
		awsAccountName: 'mock-account',
		resources: ['arn::mock::123'],
		remediationUrl: 'https://mock.url/mock',
		severity: 'critical',
		priority: 80,
		isWithinSla: true,
	};
}

describe('FBSP SLA window', () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(MOCK_TODAY);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('Returns true if a critical finding was first observed within a day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(true);
	});

	it('Returns true if a high finding was first observed within a day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'high';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(true);
	});

	it('Returns true if a critical finding was first observed within two days', () => {
		const firstObservedAt = new Date(MOCK_NEARLY_TWO_DAYS_AGO);
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(true);
	});

	it('Returns false if a critical finding is outside the window', () => {
		const firstObservedAt = new Date(MOCK_ONE_WEEK_AGO);
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(false);
	});

	it('Returns false if a low finding was first observed one day ago', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'low';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(false);
	});

	it('Returns false if a low finding was observed within one day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'low';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(false);
	});

	it('Returns false if a critical finding has no information about when it was first observed', () => {
		// This can happen as it's a nullable column in the DB
		const firstObservedAt = null;
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		expect(isWithinSla).toBe(false);
	});
});

describe('Grouping logic', () => {
	const TEAM_A_ACCOUNT_ID = '000000000';
	const TEAM_B_ACCOUNT_ID = '111111111';

	it('Should return an empty object if there are no findings to report', () => {
		const findings: Finding[] = [];
		const groupedFindings = groupFindingsByAccount(findings);

		expect(groupedFindings).toStrictEqual<GroupedFindings>({});
	});

	it('Should group findings by AWS account if there are findings to report', () => {
		const mockFinding1 = mockFinding(
			TEAM_A_ACCOUNT_ID,
			'Insecure security group configuration',
		);

		const mockFinding2 = mockFinding(
			TEAM_A_ACCOUNT_ID,
			'Insecure VPC configuration',
		);

		const mockFinding3 = mockFinding(
			TEAM_B_ACCOUNT_ID,
			'Insecure S3 bucket configuration',
		);

		const findings = [mockFinding1, mockFinding2, mockFinding3];
		const groupedFindings = groupFindingsByAccount(findings);

		expect(groupedFindings).toStrictEqual<GroupedFindings>({
			[TEAM_A_ACCOUNT_ID]: [mockFinding1, mockFinding2],
			[TEAM_B_ACCOUNT_ID]: [mockFinding3],
		});
	});

	it('Should report the same finding in two different accounts, if both accounts are affected', () => {
		const mockFinding1 = mockFinding(
			TEAM_A_ACCOUNT_ID,
			'Insecure security group configuration',
		);

		const mockFinding2 = mockFinding(
			TEAM_B_ACCOUNT_ID,
			'Insecure security group configuration',
		);

		const findings = [mockFinding1, mockFinding2];
		const groupedFindings = groupFindingsByAccount(findings);

		expect(groupedFindings).toStrictEqual<GroupedFindings>({
			[TEAM_A_ACCOUNT_ID]: [mockFinding1],
			[TEAM_B_ACCOUNT_ID]: [mockFinding2],
		});
	});
});
