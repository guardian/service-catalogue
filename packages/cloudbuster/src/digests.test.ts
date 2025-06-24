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
		app: 'my-app',
		title: 'test-title',
		within_sla: false,
	};

	it('should aggregate findings by control ID', () => {
		const actual = createDigestForAccount([
			testVuln,
			testVuln,
			{ ...testVuln, control_id: 'S.2' },
		]);
		expect(actual?.message).toContain(
			`[2 findings](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.1) in app: **my-app**, for control [S.1](https://example.com), in eu-west-1, (test-title)`,
		);
		expect(actual?.message).toContain(
			`[1 finding](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.2) in app: **my-app**, for control [S.2](https://example.com), in eu-west-1, (test-title)`,
		);
	});
	it('should show the issues with the most findings first, regardless of input ordering', () => {
		const actual = createDigestForAccount([
			{ ...testVuln, control_id: 'S.2' },
			testVuln,
			testVuln,
		]);

		const msg = actual?.message;

		const twoFindingStartPosition = msg?.indexOf('2 findings');
		const oneFindingStartPosition = msg?.indexOf('1 finding');
		expect(twoFindingStartPosition).toBeDefined();
		expect(oneFindingStartPosition).toBeDefined();
		expect(twoFindingStartPosition!).toBeLessThan(oneFindingStartPosition!);
	});
	it('should aggregate findings by app', () => {
		const actual = createDigestForAccount([
			testVuln,
			testVuln,
			{ ...testVuln, app: 'my-other-app' },
		]);
		expect(actual?.message).toContain(
			`[2 findings](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.1) in app: **my-app**, for control [S.1](https://example.com), in eu-west-1, (test-title)`,
		);
		expect(actual?.message).toContain(
			`[1 finding](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.1) in app: **my-other-app**, for control [S.1](https://example.com), in eu-west-1, (test-title)`,
		);
	});
	it('should return the correct fields', () => {
		const actual = createDigestForAccount([testVuln]);
		expect(actual?.accountId).toBe('123456789012');
		expect(actual?.accountName).toBe('test-account');
		expect(actual?.subject).toBe(
			'Security Hub findings for AWS account test-account',
		);
		expect(actual?.actions).toStrictEqual([
			{
				cta: 'View all findings on Grafana',
				url: 'https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account',
			},
		]);
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
	it('should not return each region more than once, for a given control ID-app combo', () => {
		const findings = [
			mockFinding('1', 'CRITICAL'),
			mockFinding('1', 'CRITICAL'),
			{ ...mockFinding('1', 'CRITICAL'), aws_region: 'eu-mock-2' },
			{ ...mockFinding('1', 'CRITICAL'), aws_region: 'eu-mock-2' },
		];
		const result = createDigestsFromFindings(findings, 'CRITICAL').map(
			(d) => d.message,
		).join('\n');
		const firstIdx1 = result.indexOf('eu-mock-1')
		const secondIdx1 = result.indexOf('eu-mock-1', firstIdx1 + 1);
		expect(firstIdx1).toBeGreaterThanOrEqual(0);
		expect(secondIdx1).toBe(-1); //indicates that the region only appears once

		const firstIdx2 = result.indexOf('eu-mock-2')
		const secondIdx2 = result.indexOf('eu-mock-2', firstIdx2 + 1);
		expect(firstIdx2).toBeGreaterThanOrEqual(0);
		expect(secondIdx2).toBe(-1);
	});
});
