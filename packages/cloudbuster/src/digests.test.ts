import  assert from 'assert';
import { describe, it } from 'node:test';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import type { SecurityHubSeverity } from 'common/types.js';
import { createDigestForAccount, createDigestsFromFindings } from './digests.js';


void describe('createDigestForAccount', () => {
	void it('should return nothing if no vulnerabilities are passed to it', () => {
		const actual = createDigestForAccount([]);
		assert.strictEqual(actual, undefined);
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
		suppressed: false,
	};

	void it('should aggregate findings by control ID', () => {
		const actual = createDigestForAccount([
			testVuln,
			testVuln,
			{ ...testVuln, control_id: 'S.2' },
		]);
		assert.ok(actual?.message.includes(
			`[2 findings](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.1) in app: **my-app**, for control [S.1](https://example.com), in eu-west-1 (test-title)`,
		));
		assert.ok(actual?.message.includes(
			`[1 finding](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.2) in app: **my-app**, for control [S.2](https://example.com), in eu-west-1 (test-title)`,
		));
	});
	void it('should show the issues with the most findings first, regardless of input ordering', () => {
		const actual = createDigestForAccount([
			{ ...testVuln, control_id: 'S.2' },
			testVuln,
			testVuln,
		]);

		const msg = actual?.message;

		const twoFindingStartPosition = msg?.indexOf('2 findings');
		const oneFindingStartPosition = msg?.indexOf('1 finding');
		assert.notStrictEqual(twoFindingStartPosition, undefined);
		assert.ok(twoFindingStartPosition != null);
		assert.notStrictEqual(oneFindingStartPosition, undefined);
		assert.ok(oneFindingStartPosition != null);
		assert.ok(twoFindingStartPosition < oneFindingStartPosition);
	});
	void it('should aggregate findings by app', () => {
		const actual = createDigestForAccount([
			testVuln,
			testVuln,
			{ ...testVuln, app: 'my-other-app' },
		]);
		assert.ok(actual?.message.includes(
			`[2 findings](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.1) in app: **my-app**, for control [S.1](https://example.com), in eu-west-1 (test-title)`,
		));
		assert.ok(actual?.message.includes(
			`[1 finding](https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account&var-control_id=S.1) in app: **my-other-app**, for control [S.1](https://example.com), in eu-west-1 (test-title)`,
		));
	});
	void it('should return the correct fields', () => {
		const actual = createDigestForAccount([testVuln]);
		assert.strictEqual(actual?.accountId, '123456789012');
		assert.strictEqual(actual.accountName, 'test-account');
		assert.strictEqual(actual.subject, 
			'Security Hub findings for AWS account test-account',
		);
		assert.deepStrictEqual(actual.actions, [
			{
				cta: 'View all findings on Grafana',
				url: 'https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=test-account',
			},
		]);
	});
	void it('should return nothing if the first observed date is older than the cut-off', () => {
		const vuln = { ...testVuln, first_observed_at: new Date(0) };
		const actual = createDigestForAccount([vuln]);
		assert.strictEqual(actual, undefined);
	});
	void it('should correctly encode the account name in the CTA URL', () => {
		const vuln = { ...testVuln, aws_account_name: 'test account' };
		const actual = createDigestForAccount([vuln]);
		assert.ok(actual?.actions[0]?.url.includes('test%20account'));
	});
	void it('should not return a digest if the account name is null', () => {
		const vuln = { ...testVuln, aws_account_name: null };
		const actual = createDigestForAccount([vuln]);
		assert.strictEqual(actual, undefined);
	});
	void it('should not include the app tag in the message if app is null', () => {
		const vuln = { ...testVuln, app: null };
		const actual = createDigestForAccount([vuln]);
		assert.ok(!actual?.message.includes('in app:'));
	})
	void it('should include the app tag in the message if app exists', () => {
		const actual = createDigestForAccount([testVuln]);
		assert.ok(actual?.message.includes(`in app: **${testVuln.app}**,`));
	})
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
		suppressed: false,
	};
}

void describe('createDigestsFromFindings', () => {
	void it('should filter findings by severity', () => {
		const findings = [
			mockFinding('1', 'CRITICAL'),
			mockFinding('2', 'HIGH'),
			mockFinding('3', 'CRITICAL'),
		];
		const criticalDigests = createDigestsFromFindings(findings, 'CRITICAL');
		assert.strictEqual(criticalDigests.length, 2);

		const highDigests = createDigestsFromFindings(findings, 'HIGH');
		assert.strictEqual(highDigests.length, 1);
	});
	void it('should create one digest per account', () => {
		const findingsFromTwoAccounts = [
			mockFinding('1', 'CRITICAL'),
			mockFinding('2', 'CRITICAL'),
			mockFinding('3', 'CRITICAL'),
		];
		const result = createDigestsFromFindings(
			findingsFromTwoAccounts,
			'CRITICAL',
		);
		assert.strictEqual(result.length, 3);
	});
	void it('should combine findings of the same account and severity into one digest', () => {
		const findingsFromOneAccount = [
			mockFinding('1', 'CRITICAL'),
			mockFinding('1', 'CRITICAL'),
			mockFinding('1', 'CRITICAL'),
		];
		const result = createDigestsFromFindings(
			findingsFromOneAccount,
			'CRITICAL',
		);
		assert.strictEqual(result.length, 1);
	});
	void it('should not return each region more than once, for a given control ID-app combo', () => {
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
		assert.ok(firstIdx1 >= 0)
		assert.strictEqual(secondIdx1, -1); //indicates that the region only appears once

		const firstIdx2 = result.indexOf('eu-mock-2')
		const secondIdx2 = result.indexOf('eu-mock-2', firstIdx2 + 1);
		assert.ok(firstIdx2 >= 0);
		assert.strictEqual(secondIdx2, -1);
	});
});
