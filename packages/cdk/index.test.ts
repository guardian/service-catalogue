import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { App } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import type { CloudqueryEcsClusterProps } from './lib/cloudquery';
import { addCloudqueryEcsCluster } from './lib/cloudquery';

const logShippingPolicy = new PolicyStatement({
	actions: ['kinesis:Describe*', 'kinesis:Put*'],
	effect: Effect.ALLOW,
	resources: ['test'],
});

class MockGuStack extends GuStack {
	constructor() {
		const app = new App();
		const id = 'MockStack';
		const props: GuStackProps = {
			stack: 'test-stack',
			stage: 'TEST',
		};
		super(app, id, props);
	}
}

const mockStack = new MockGuStack();

const mockVpc: IVpc = {
	selectSubnets: jest.fn(() => ({
		subnets: [],
		subnetIds: [],
		availabilityZones: [],
	})),
	// Add other required IVpc properties/methods if needed
} as unknown as IVpc;

const mockSecret = new Secret(mockStack, 'MockSecret');

// Mock DatabaseInstance with a secret property
const mockDb = {
	secret: mockSecret,
	grantConnect: jest.fn(),
} as unknown as DatabaseInstance;

const mockProps: CloudqueryEcsClusterProps = {
	vpc: mockVpc,
	db: mockDb,
	dbAccess: {} as GuSecurityGroup,
	loggingStreamName: 'test',
	logShippingPolicy: logShippingPolicy,
	gitHubOrg: 'guardian',
	cloudqueryApiKey: mockSecret,
	enableCloudquerySchedules: true,
};

const cluster = addCloudqueryEcsCluster(mockStack, mockProps);

console.log('Cluster created with tasks:', cluster.tasks.length);

// Check all sources are defined

const arrayOfExpectedCloudqueryTaskNames = [
	'AmigoBakePackages',
	'AwsCostExplorer',
	'AwsDelegatedToSecurityAccount',
	'AwsLambda',
	'AwsListOrgs',
	'AwsOrgWideAutoScalingGroups',
	'AwsOrgWideBackup',
	'AwsOrgWideCertificates',
	'AwsOrgWideCloudFormation',
	'AwsOrgWideCloudwatchAlarms',
	'AwsOrgWideDynamoDB',
	'AwsOrgWideEc2',
	'AwsOrgWideEc2Images',
	'AwsOrgWideIamCredentialReports',
	'AwsOrgWideLoadBalancers',
	'AwsOrgWideRDS',
	'AwsOrgWideS3',
	'AwsOrgWideSns',
	'AwsRemainingDataPart1',
	'AwsRemainingDataPart2',
	'AwsSSMParameters',
	'EndOfLife',
	'FastlyServices',
	'Galaxies',
	'GitHubIssues',
	'GitHubLanguages',
	'GitHubReleases',
	'GitHubRepositories',
	'GitHubTeams',
	'NS1',
	'RiffRaffData',
];

it('all expected cloudquery tasks are defined', () => {
	const cloudquerySourceNames = cluster.sources.map((s) => s.name).sort();
	const expectedNames = arrayOfExpectedCloudqueryTaskNames.slice().sort();

	const missing = expectedNames.filter(
		(name) => !cloudquerySourceNames.includes(name),
	);
	const extra = cloudquerySourceNames.filter(
		(name) => !expectedNames.includes(name),
	);

	if (missing.length > 0) {
		console.log('Missing sources:', missing);
	}
	if (extra.length > 0) {
		console.log('Extra sources:', extra);
	}

	expect(cloudquerySourceNames).toEqual(expectedNames);
});

// 9/2025: We had a problem with the Cloudquery task definition exceeding the ECS limit of 65536 bytes
// "Invalid request provided: Create TaskDefinition: Actual length: '74049'. Max allowed length is '65536' bytes. (Service: AmazonECS
// Getting the length of the entire taskDefinition is difficult

// The values for AwsRemainingData task were
// TaskDefinition Size: 74049, Tables array size: 23881 bytes, Number of tables: 757
// Source AwsRemainingDataPart1 has 378 tables, tables array bytes: 12256
// Source AwsRemainingDataPart2 has 379 tables, tables array bytes: 11626
// 700 tables, tables array bytes: 22276, TaskDefinition Size: 69867
// 757 tables, tables array bytes: 23881, TaskDefinition Size: 74049
// Difference 57 tables, table array bytes 23881 - 22276 = 1605 bytes, TaskDefinition 74049 - 69867 = 4182 bytes
// Roughly every table adds about 28 bytes to the tables array, and about 74 bytes to the task definition
// Too many bytes when 700 tables: 69867 - 65536 = 4331 bytes too many

// Try 645 tables Create TaskDefinition: Actual length: '65543'. Max allowed length is '65536' bytes
// so 644 would be ok, use 600 to be on the safe side

// This deployed just fine
// Tried 600 tables, also deployed fine
// Tried 700 tables, Actual length: '69867'. Max allowed length is '65536' bytes

const TABLE_LIMIT = 600; // Should be under the 65536 byte limit, 644 might be still ok
it(`no cloudquery tasks should exceeding the ${TABLE_LIMIT} tables limit`, () => {
	const exceedingSources: Array<{
		name: string;
		tableCount: number;
		tableBytes: number;
	}> = [];

	cluster.sources.forEach((source) => {
		const tables = source.config.spec.tables;
		if (Array.isArray(tables)) {
			const tableCount = tables.length;
			const tableBytes = Buffer.byteLength(JSON.stringify(tables), 'utf8');
			if (tableCount > TABLE_LIMIT) {
				exceedingSources.push({ name: source.name, tableCount, tableBytes });
			}
		} else {
			throw new Error(
				`config.spec.tables is not an array or is undefined for source: ${source.name}`,
			);
		}
	});

	if (exceedingSources.length > 0) {
		exceedingSources.forEach(({ name, tableCount, tableBytes }) => {
			console.log(
				`Source ${name} has ${tableCount} tables (exceeds ${TABLE_LIMIT}), tables array bytes: ${tableBytes}`,
			);
		});
	}
	expect(exceedingSources.length).toBe(0);
});
