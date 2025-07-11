import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ServiceCatalogue } from './service-catalogue';

describe('The ServiceCatalogue stack', () => {
	beforeAll(() => {
		/*
		Each CloudQuery task generates a SQL statement to insert its cadence into the `cloudquery_table_frequency` database table.
		This value can change depending on how many days there are in the current month.

		For example, for a task that runs on the first of every month (` Schedule.cron({ day: '1', hour: '0', minute: '0' })`):
		- In May the value will be 2678400000 (31 days)
		- In June the value will be 2592000000 (30 days)

		Mock the current date to ensure the Jest snapshot is stable.
		 */
		const date = new Date('2025-05-01');
		vi.useFakeTimers().setSystemTime(date);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it('matches the snapshot', () => {
		const app = new App();
		const stack = new ServiceCatalogue(app, 'ServiceCatalogue', {
			stack: 'deploy',
			stage: 'TEST',
			securityAlertSchedule: Schedule.cron({
				weekDay: 'MON-FRI',
				hour: '3',
				minute: '0',
			}),
			enableCloudquerySchedules: true,
			databaseDeletionProtection: true,
			databaseMultiAz: false,
			databaseInstanceType: InstanceType.of(
				InstanceClass.T4G,
				InstanceSize.SMALL,
			),
			databaseEbsByteBalanceAlarm: true,
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('only uses arm64 lambdas', () => {
		const app = new App();
		const stack = new ServiceCatalogue(app, 'ServiceCatalogue', {
			stack: 'deploy',
			stage: 'TEST',
			securityAlertSchedule: Schedule.cron({
				weekDay: 'MON-FRI',
				hour: '3',
				minute: '0',
			}),
			enableCloudquerySchedules: true,
			databaseDeletionProtection: true,
			databaseMultiAz: true,
			databaseInstanceType: InstanceType.of(
				InstanceClass.T4G,
				InstanceSize.SMALL,
			),
			databaseEbsByteBalanceAlarm: true,
		});

		const lambdas = stack.node
			.findAll()
			.filter((child): child is CfnFunction => child instanceof CfnFunction);

		const architectures = new Set(
			lambdas.flatMap((lambda) => lambda.architectures),
		);

		// Only 1 architecture is used...
		expect(architectures.size).toEqual(1);

		// ...and it's arm64
		expect(architectures.has('arm64')).toEqual(true);
	});
});
