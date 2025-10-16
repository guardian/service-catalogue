import assert from 'assert';
import { describe, it } from 'node:test';
import { filterAllowedTables } from './filter.js';

void describe('filterCollectedTables', () => {
	void it('should filter aws_organization*', () => {
		const tables = [
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
			'aws_appstream',
			'aws_ec2_instance',
		];
		const filterRegEx = [/^aws_organization.*$/];
		const result: string[] = filterAllowedTables(tables, filterRegEx);
		assert.deepStrictEqual(result, [
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
		]);
	});
});

void describe('filterCollectedTables from array', () => {
	void it('should filter aws_organization* and aws_ec2*', () => {
		const tables = [
			'aws_ec2_instance',
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
			'aws_appstream',
		];
		const filterRegEx = [/^aws_organization.*$/, /^aws_ec2*.*$/];
		const result = filterAllowedTables(tables, filterRegEx);
		assert.deepStrictEqual(result, [
			'aws_ec2_instance',
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
		]);
	});
});
