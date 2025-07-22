import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { cloudquery_plugin_usage } from '@prisma/client';
import { usageSummaryToDatabaseRows } from './transform.js';
import type { UsageSummaryResponseForPaidRows } from './types.js';

void describe('usageSummaryToDatabaseRows', () => {
	void test('converts a UsageSummaryResponse to an array of guardian_cloudquery_usage', () => {
		const input: UsageSummaryResponseForPaidRows = {
			groups: [
				{
					name: 'plugin',
					value: 'cloudquery/source/aws',
				},
				{
					name: 'plugin',
					value: 'cloudquery/source/snyk',
				},
			],
			metadata: {
				aggregation_period: 'day',
				end: '2024-01-10T00:00:00Z',
				metrics: ['paid_rows'],
				start: '2024-01-09T00:00:00Z',
			},
			values: [
				{
					paid_rows: [1006, 42029],
					timestamp: '2024-01-09T00:00:00Z',
				},
				{
					paid_rows: [1006, 42008],
					timestamp: '2024-01-10T00:00:00Z',
				},
			],
		};

		const expected: cloudquery_plugin_usage[] = [
			{
				timestamp: new Date('2024-01-09T00:00:00Z'),
				metric: 'paid_rows',
				name: 'cloudquery/source/aws',
				value: 1006,
			},
			{
				timestamp: new Date('2024-01-10T00:00:00Z'),
				metric: 'paid_rows',
				name: 'cloudquery/source/aws',
				value: 1006,
			},
			{
				timestamp: new Date('2024-01-09T00:00:00Z'),
				metric: 'paid_rows',
				name: 'cloudquery/source/snyk',
				value: 42029,
			},
			{
				timestamp: new Date('2024-01-10T00:00:00Z'),
				metric: 'paid_rows',
				name: 'cloudquery/source/snyk',
				value: 42008,
			},
		];

		const actual = usageSummaryToDatabaseRows(input);

		assert.deepEqual(actual, expected);
	});
});
