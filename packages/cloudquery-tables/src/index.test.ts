import assert from 'assert';
import { describe, it } from 'node:test';
import {
	_cloudQueryTablesToSync,
	filterCloudQueryTables,
} from 'cloudquery-tables/index';

void describe('The table list', () => {
	/*
	Wildcard matching can sync more tables than expected. Therefore, enforce that the list is fully deterministic.
	See also https://docs.cloudquery.io/docs/advanced/performance-tuning#use-wildcard-matching.
	 */
	void it('does not include any wildcard table names', () => {
		const wildcards = _cloudQueryTablesToSync.filter((table) =>
			table.includes('*'),
		);
		assert.strictEqual(wildcards.length, 0);
	});
});

void describe('The filtering function', () => {
	void it('should filter aws_organization*', () => {
		const result = filterCloudQueryTables([/^aws_organization.*$/]);
		assert.deepStrictEqual(result, [
			'aws_organization_resource_policies',
			'aws_organizations',
			'aws_organizations_account_parents',
			'aws_organizations_accounts',
			'aws_organizations_delegated_administrators',
			'aws_organizations_delegated_services',
			'aws_organizations_organizational_unit_parents',
			'aws_organizations_organizational_units',
			'aws_organizations_policies',
			'aws_organizations_roots',
		]);
	});
});
