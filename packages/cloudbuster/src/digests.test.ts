import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import { createDigestForAccount } from './digests';

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
});
