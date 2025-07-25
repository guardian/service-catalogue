import assert from 'assert';
import fs from 'fs';
import { after, before, describe, it, mock, test } from 'node:test';
import path from 'path';
import { fileURLToPath } from 'url';
import { MetadataKeys } from '@guardian/cdk/lib/constants/metadata-keys.js';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { ServiceCatalogue } from './service-catalogue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSnapshotPath(name: string) {
    return path.join(__dirname, '__snapshots__', `${name}.test.ts.json`);
}

function writeSnapshot(snapshotPath: string, data: unknown) {
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2) + '\n');
}

function readSnapshot(snapshotPath: string): string {
    return fs.readFileSync(snapshotPath, 'utf-8');
}

function compareSnapshot(name: string, actual: unknown) {
    const snapshotPath = getSnapshotPath(name);
    const updateSnapshots = process.argv.includes('--update-snapshots');
    const actualString = JSON.stringify(actual, null, 2) + '\n';

    if (updateSnapshots || !fs.existsSync(snapshotPath)) {
        writeSnapshot(snapshotPath, actual);
        return;
    }

    const expectedString = readSnapshot(snapshotPath);
    assert.strictEqual(actualString, expectedString);
}

// Create a type-safe mock for all metadata keys
const trackingTagMock: Record<string, string> = Object.fromEntries(
  Object.values(MetadataKeys).map((key) => [key, "TEST"])
);
class TestServiceCatalogue extends ServiceCatalogue {
    trackingTag: typeof trackingTagMock = trackingTagMock;
}

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

void test('matches the snapshot', () => {
    const app = new App();
    const stack = new TestServiceCatalogue(app, 'ServiceCatalogue', {
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
    compareSnapshot('service-catalogue', template.toJSON());
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
		 assert.strictEqual(architectures.size, 1);

		// ...and it's arm64
		assert.ok(architectures.has('arm64'));
	});
});
