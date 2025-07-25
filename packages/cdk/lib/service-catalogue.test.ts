
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

// Function to normalize ALL metadata key values in the template
function normalizeTemplate(template: Record<string, unknown>): Record<string, unknown> {
    const templateStr = JSON.stringify(template);
    
    // Get all metadata keys and create replacements for each one
    const metadataKeys = Object.values(MetadataKeys);
    let normalizedStr = templateStr;
    
    metadataKeys.forEach(key => {
        // Replace any value for this metadata key with "TEST"
        // This handles both string values and object properties
        const keyRegex = new RegExp(`"${key}":\\s*"[^"]*"`, 'g');
        normalizedStr = normalizedStr.replace(keyRegex, `"${key}": "TEST"`);
    });
    
    return JSON.parse(normalizedStr) as Record<string, unknown>;
}

function compareSnapshot(name: string, actual: unknown) {
    const snapshotPath = getSnapshotPath(name);
    const updateSnapshots = process.argv.includes('--update-snapshots');
    
    // Normalize the actual template to replace all metadata values
    const normalizedActual = normalizeTemplate(actual as Record<string, unknown>);
    const actualString = JSON.stringify(normalizedActual, null, 2) + '\n';

    if (updateSnapshots || !fs.existsSync(snapshotPath)) {
        writeSnapshot(snapshotPath, normalizedActual);
        return;
    }

    const expectedString = readSnapshot(snapshotPath);
    assert.strictEqual(actualString, expectedString);
}

void describe('The ServiceCatalogue stack', () => {
    before(() => {
        mock.timers.enable({ 
            apis: ['Date'],
            now: new Date('2025-05-01').getTime() 
        });
    });

    after(() => {
        mock.timers.reset();
    });

    void test('matches the snapshot', () => {
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
        compareSnapshot('service-catalogue', template.toJSON());
    });
    
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

        assert.strictEqual(architectures.size, 1);
        assert.ok(architectures.has('arm64'));
    });
});