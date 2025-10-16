import assert from 'assert';
import { describe, it } from 'node:test';
import { cloudQueryTablesToSync } from 'cloudquery-tables/index';

void describe('The table list', () => {
	/*
	Wildcard matching can sync more tables than expected. Therefore, enforce that the list is fully deterministic.
	See also https://docs.cloudquery.io/docs/advanced/performance-tuning#use-wildcard-matching.
	 */
	void it('does not include any wildcard table names', () => {
		const wildcards = cloudQueryTablesToSync.filter((table) =>
			table.includes('*'),
		);
		assert.strictEqual(wildcards.length, 0);
	});
});
