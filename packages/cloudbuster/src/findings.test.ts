import  assert from 'assert';
import { describe, it } from 'node:test';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import type { SecurityHubFinding } from 'common/types';
import { findingsToGuardianFormat, groupFindingsByAccount } from './findings';
import type { GroupedFindings } from './types';


void describe('findingsToGuardianFormat', () => {
	const resource1 = {
		Id: 'arn:instance:1',
		Tags: { Stack: 'myStack', FakeTag: 'fake' },
		Region: 'some-region',
		Type: 'some-type',
	};
	const resource2 = {
		...resource1,
		Id: 'arn:instance:2',
	};

	const x: SecurityHubFinding = {
		title: 'title',
		aws_account_name: 'accountName',
		remediation: { Recommendation: { Url: 'url' } },
		severity: { Label: 'HIGH', Normalized: 75 },
		aws_account_id: '0123456',
		first_observed_at: new Date('2020-01-01'),
		product_fields: { ControlId: 'S.1' },
		resources: [resource1, resource2],
		workflow: { Status: 'NEW' },
	};

	void it('should return n elements if n resources are associated with a finding', () => {
		const actual = findingsToGuardianFormat(x);
		assert.strictEqual(actual.length, 2);
	});
	void it('should return the relevant data in the appropriate fields', () => {
		const actual = findingsToGuardianFormat(x);
		const expected: cloudbuster_fsbp_vulnerabilities = {
			severity: 'HIGH',
			control_id: 'S.1',
			title: 'title',
			aws_region: 'some-region',
			repo: null,
			stack: 'myStack',
			stage: null,
			app: null,
			first_observed_at: new Date('2020-01-01'),
			arn: 'arn:instance:1',
			aws_account_name: 'accountName',
			aws_account_id: '0123456',
			within_sla: false,
			remediation: 'url',
			suppressed: false,
		};
		assert.deepStrictEqual(actual[0], expected);
		assert.deepStrictEqual(actual[1], { ...expected, arn: 'arn:instance:2' });
	});
	void it('should detect whether a finding is suppressed or not', () => {
		expect(findingsToGuardianFormat(x)[0]?.suppressed).toBe(false);
		expect(findingsToGuardianFormat({ ...x, workflow: { Status: 'NOTIFIED' } })[0]?.suppressed).toBe(false);
		expect(findingsToGuardianFormat({ ...x, workflow: { Status: 'SUPPRESSED' } })[0]?.suppressed).toBe(true);
		expect(findingsToGuardianFormat({ ...x, workflow: { Status: 'RESOLVED' } })[0]?.suppressed).toBe(false);

	});
});

function mockFinding(
	aws_account_id: string,
	title: string,
): cloudbuster_fsbp_vulnerabilities {
	return {
		aws_account_id,
		title,
		aws_account_name: 'mock-account',
		arn: 'arn::mock::123',
		remediation: 'https://mock.url/mock',
		severity: 'critical',
		within_sla: true,
		first_observed_at: new Date('2020-01-01'),
		control_id: 'MOCK.1',
		aws_region: 'eu-mock-1',
		repo: null,
		stack: null,
		stage: null,
		app: null,
		suppressed: false,
	};
}

void describe('Grouping logic', () => {
	const TEAM_A_ACCOUNT_ID = '000000000';
	const TEAM_B_ACCOUNT_ID = '111111111';

	void it('Should return an empty object if there are no findings to report', () => {
		const findings: cloudbuster_fsbp_vulnerabilities[] = [];
		const groupedFindings = groupFindingsByAccount(findings);

		assert.deepStrictEqual(groupedFindings, <GroupedFindings>({}));
	});

	void it('Should group findings by AWS account if there are findings to report', () => {
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

		assert.deepStrictEqual(groupedFindings, <GroupedFindings>({
			[TEAM_A_ACCOUNT_ID]: [mockFinding1, mockFinding2],
			[TEAM_B_ACCOUNT_ID]: [mockFinding3],
		}));
	});

	void it('Should report the same finding in two different accounts, if both accounts are affected', () => {
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

		assert.deepStrictEqual(groupedFindings, <GroupedFindings>({
			[TEAM_A_ACCOUNT_ID]: [mockFinding1],
			[TEAM_B_ACCOUNT_ID]: [mockFinding2],
		}));
	});
});
