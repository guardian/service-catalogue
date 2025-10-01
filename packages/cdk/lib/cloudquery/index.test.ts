import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { App } from 'aws-cdk-lib';
import type { IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { addCloudqueryEcsCluster } from './index';
import type { CloudqueryEcsClusterProps } from './index';

const logShippingPolicy = new PolicyStatement({
	actions: ['kinesis:Describe*', 'kinesis:Put*'],
	effect: Effect.ALLOW,
	resources: ['test'],
});

it('should not exceed ECS TaskDefinition size limit', () => {
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
		selectSubnets: jest.fn((selection?: SubnetSelection) => ({
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

	//console.log(cluster.tasks);

	for (const source of cluster.sources) {
		console.log('Source name:', source.name);
		console.log('Source description:', source.description);
		if (source.config.spec.tables) {
			console.log('Source number of tables:', source.config.spec.tables.length);
		}
	}

	if (cluster.tasks[0]) {
		//console.log(cluster.tasks[0].taskDefinition);
		const yaml = JSON.stringify(cluster.tasks[0].taskDefinition);
		console.log('cpu: ', cluster.tasks[0].taskDefinition.cpu);
		// console.log(
		// 	'command: ',
		// 	cluster.tasks[0].taskDefinition.containers[0].props.command,
		// );
		// Check the byte length
		const byteLength = Buffer.byteLength(yaml, 'utf8');
		console.log(byteLength);
		expect(byteLength).toBeLessThanOrEqual(65536);
	}
	//console.log(cluster.tasks[0].taskDefinition.containers[0].props.command);
	// Check AwsRemainingDataTaskDefinition
	// How do I get this?
	const yaml = JSON.stringify(cluster.toString());

	// Check the byte length
	const byteLength = Buffer.byteLength(yaml, 'utf8');
	console.log(byteLength);
	expect(byteLength).toBeLessThanOrEqual(65536);
});
