import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import type { SecurityHubSeverity } from 'common/types';
import { createDigestsFromFindings } from './digests';

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
		first_observed_at: new Date('2020-01-01'),
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
