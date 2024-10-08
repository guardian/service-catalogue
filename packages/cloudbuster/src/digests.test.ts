import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import type { SecurityHubSeverity } from 'common/types';
import { createDigestForAccount, createDigestsFromFindings } from './digests';

describe('createDigestForAccount', () => {
	it('should return nothing if no vulnerabilities are passed to it', () => {
		const actual = createDigestForAccount([]);
		expect(actual).toBeUndefined();
	});

	const testVuln: cloudbuster_fsbp_vulnerabilities = {
		aws_account_id: '123456789012',
		aws_account_name: 'test-account',
		aws_region: 'eu-west-1',
		arn: 'arn:aws:service:eu-west-1:123456789012',
		control_id: 'S.1',
		first_observed_at: new Date(),
		remediation: 'https://example.com',
		severity: 'CRITICAL',
		repo: null,
		stack: null,
		stage: null,
		app: null,
		title: 'test-title',
		within_sla: false,
	};

	it('should return a digest with the correct fields', () => {
		const actual = createDigestForAccount([testVuln]);
		expect(actual).toEqual({
			accountId: '123456789012',
			accountName: 'test-account',
			actions: [
				{
					cta: 'View all findings on Grafana',
					url: 'https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account',
				},
			],
			subject: 'Security Hub findings for AWS account test-account',
			message: `The following vulnerabilities have been found in your account in the last 60 days:
        **[CRITICAL] test-title**
Affected resource: arn:aws:service:eu-west-1:123456789012
Remediation: [Documentation](https://example.com)`,
		});
	});
	it('should return nothing if the first observed date is older than the cut-off', () => {
		const vuln = { ...testVuln, first_observed_at: new Date(0) };
		const actual = createDigestForAccount([vuln]);
		expect(actual).toBeUndefined();
	});
	it('should correctly encode the account name in the CTA URL', () => {
		const vuln = { ...testVuln, aws_account_name: 'test account' };
		const actual = createDigestForAccount([vuln]);
		expect(actual?.actions[0]?.url).toContain('test%20account');
	});
	it('should not return a digest if the account name is null', () => {
		const vuln = { ...testVuln, aws_account_name: null };
		const actual = createDigestForAccount([vuln]);
		expect(actual).toBeUndefined();
	});
});

function mockFinding(
	aws_account_id: string,
	severity: SecurityHubSeverity,
): cloudbuster_fsbp_vulnerabilities {
	return {
		aws_account_id,
		title: 'mock title',
		aws_account_name: 'mock-account',
		arn: 'arn::mock::123',
		remediation: 'https://mock.url/mock',
		severity,
		within_sla: true,
		first_observed_at: new Date(),
		control_id: 'MOCK.1',
		aws_region: 'eu-mock-1',
		repo: null,
		stack: null,
		stage: null,
		app: null,
	};
}

describe('createDigestsFromFindings', () => {
	it('should filter findings by severity', () => {
		const findings = [
			mockFinding('1', 'CRITICAL'),
			mockFinding('2', 'HIGH'),
			mockFinding('3', 'CRITICAL'),
		];
		const criticalDigests = createDigestsFromFindings(findings, 'CRITICAL');
		expect(criticalDigests.length).toBe(2);

		const highDigests = createDigestsFromFindings(findings, 'HIGH');
		expect(highDigests.length).toBe(1);
	});
	it('should create one digest per account', () => {
		const findingsFromTwoAccounts = [
			mockFinding('1', 'CRITICAL'),
			mockFinding('2', 'CRITICAL'),
			mockFinding('3', 'CRITICAL'),
		];
		const result = createDigestsFromFindings(
			findingsFromTwoAccounts,
			'CRITICAL',
		);
		expect(result.length).toBe(3);
	});
	it('should combine findings of the same account and severity into one digest', () => {
		const findingsFromOneAccount = [
			mockFinding('1', 'CRITICAL'),
			mockFinding('1', 'CRITICAL'),
			mockFinding('1', 'CRITICAL'),
		];
		const result = createDigestsFromFindings(
			findingsFromOneAccount,
			'CRITICAL',
		);
		expect(result.length).toBe(1);
	});
});
