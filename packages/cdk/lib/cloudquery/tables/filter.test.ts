import { filterAllowedTables } from './filter';

describe('filterCollectedTables', () => {
	it('should filter aws_organization*', () => {
		const tables = [
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
			'aws_appstream',
			'aws_ec2_instance',
		];
		const filterRegEx = [/^aws_organization.*$/];
		const result: string[] = filterAllowedTables(tables, filterRegEx);
		expect(result).toEqual([
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
		]);
	});
});

describe('filterCollectedTables from array', () => {
	it('should filter aws_organization* and aws_ec2*', () => {
		const tables = [
			'aws_ec2_instance',
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
			'aws_appstream',
		];
		const filterRegEx = [/^aws_organization.*$/, /^aws_ec2*.*$/];
		const result = filterAllowedTables(tables, filterRegEx);
		expect(result).toEqual([
			'aws_ec2_instance',
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
		]);
	});
});
