import assert from 'assert';
import fs from 'fs';
import { after, before, describe, it, mock, test } from 'node:test';
import path from 'path';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { ServiceCatalogue } from './service-catalogue.js';


void describe('The ServiceCatalogue stack', () => {

    before(() => {
		/*
		Each CloudQuery task generates a SQL statement to insert its cadence into the `cloudquery_table_frequency` database table.
		This value can change depending on how many days there are in the current month.
    For example, for a task that runs on the first of every month (` Schedule.cron({ day: '1', hour: '0', minute: '0' })`):
		- In May the value will be 2678400000 (31 days)
		- In June the value will be 2592000000 (30 days)
		Mock the current date to ensure the Jest snapshot is stable.
		 */
		mock.timers.enable({ 
			apis: ['Date'],
			now: new Date('2025-05-01').getTime() 
		});
		// const date = new Date('2025-05-01');
		// jest.useFakeTimers().setSystemTime(date);
	});

	after(() => {
		mock.timers.reset();
		// jest.useRealTimers();
	});

void test('matches the snapshot', async (t) => {
	 // Mock modules before importing your stack
    await t.mock.import('@guardian/cdk/lib/constants/tracking-tag', {
        default: 'mocked-tracking-tag',
        // ...other exports as needed
    });
	await t.mock('@guardian/private-infrastructure-config', {
		default: {},
		// ...other exports as needed
	});
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
    const snapshotPath = path.join(__dirname, '__snapshots__', 'service-catalogue.snapshot.json');
    const output = template.toJSON();

    // Check for CLI flag
    const updateSnapshots = process.argv.includes('--update-snapshots');

    if (updateSnapshots || !fs.existsSync(snapshotPath)) {
        fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
        fs.writeFileSync(snapshotPath, JSON.stringify(output, null, 2));
        return; // Optionally skip assertion when updating
    }

	const expected: Record<string, unknown> = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8')) as Record<string, unknown>;
	assert.deepStrictEqual(output, expected);
});
		// expect(template.toJSON()).toMatchSnapshot();
	// });

	void it('only uses arm64 lambdas', () => {
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
		 assert(architectures.size, 1);

		// ...and it's arm64
		assert.ok(architectures.has('arm64'));
	});
});
