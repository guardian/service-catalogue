import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import type { SecurityHubFinding } from 'common/types';
import { findingsToGuardianFormat, groupFindingsByAccount } from './findings';
import type { GroupedFindings } from './types';

describe('findingsToGuardianFormat', () => {
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
	it('should return n elements if n resources are associated with a finding', () => {
		const actual = findingsToGuardianFormat(x);
		expect(actual.length).toEqual(2);
	});
	it('should return the relevant data in the appropriate fields', () => {
		const actual = findingsToGuardianFormat(x);
		const expected = {
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
		};
		expect(actual[0]).toEqual(expected);
		expect(actual[1]).toEqual({ ...expected, arn: 'arn:instance:2' });
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
	};
}

describe('Grouping logic', () => {
	const TEAM_A_ACCOUNT_ID = '000000000';
	const TEAM_B_ACCOUNT_ID = '111111111';

	it('Should return an empty object if there are no findings to report', () => {
		const findings: cloudbuster_fsbp_vulnerabilities[] = [];
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

const ec2_9Finding: SecurityHubFinding = {
	title: 'EC2.9 EC2 instances should not have a public IPv4 address',
	aws_account_name: 'accountName',
	remediation: { Recommendation: { Url: 'url' } },
	severity: { Label: 'HIGH', Normalized: 75 },
	aws_account_id: '0123456',
	first_observed_at: new Date('2020-01-01'),
	product_fields: { ControlId: 'EC2.9' },
	resources: [
		{
			Id: 'arn:aws:ec2:region:0123456:instance/i-1234567890abcdef0',
			Tags: { 'aws:autoscaling:groupName': 'my-asg' },
			Region: 'us-east-1',
			Type: 'AwsEc2Instance',
		},
	],
	workflow: { Status: 'NEW' },
};

const ec2_8Finding: SecurityHubFinding = {
	...ec2_9Finding
	, title: 'EC2.8 EC2 instances should use Instance Metadata Service Version 2 (IMDSv2)',
	product_fields: { ControlId: 'EC2.8' },
};

describe('When parsing EC2.8 and EC2.9 findings', () => {



	it('should not return findings for EC2 instances that are part of an AutoScaling group', () => {
		const results = [ec2_8Finding, ec2_9Finding].flatMap(findingsToGuardianFormat);
		expect(results).toEqual([]);
	});
	it('should return findings for EC2 instances that are not part of an AutoScaling group', () => {
		const findingWithoutAsg: SecurityHubFinding = {
			...ec2_9Finding,
			resources: [
				{
					Id: 'arn:aws:ec2:region:0123456:instance/i-0987654321fedcba0',
					Tags: {},
					Region: 'us-east-1',
					Type: 'AwsEc2Instance',
				},
			],
		};
		const results = findingsToGuardianFormat(findingWithoutAsg);
		expect(results.length).toBe(1);
		expect(results[0]!.control_id).toBe('EC2.9');
	});

});

describe('When parsing findings that are not EC2.8 or EC2.9', () => {
	it('should return those findings, even if they have an ASG tag', () => {
		const finding: SecurityHubFinding = {
			...ec2_9Finding,
			title: 'EC2.17 Amazon EC2 instances should not use multiple ENIs',
			product_fields: { ControlId: 'EC2.17' },
		};
		const results = findingsToGuardianFormat(finding);
		expect(finding.resources[0]?.Tags?.['aws:autoscaling:groupName']).toBeDefined();
		expect(results.length).toBe(1);
		expect(results[0]!.control_id).toBe('EC2.17');
	});
});
