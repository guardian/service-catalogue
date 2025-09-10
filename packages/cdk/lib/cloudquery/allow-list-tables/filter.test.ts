import { awsTables } from './aws-table-list';
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
		const filterRegEx = ['aws_organization*'];
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
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
			'aws_appstream',
			'aws_ec2_instance',
		];
		const filterRegEx = ['aws_organization*', 'aws_ec2*'];
		const result = filterAllowedTables(tables, filterRegEx);
		expect(result).toEqual([
			'aws_organization',
			'aws_organization_account',
			'aws_organization_policy',
			'aws_ec2_instance',
		]);
	});
});

describe('filter allow-list-tables', () => {
	it('should filter aws_organization* from aws-table-list.ts', () => {
		const filterRegEx = ['aws_organization*'];
		const result = filterAllowedTables(awsTables, filterRegEx);
		expect(result).toEqual([
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

	it('should filter aws_wafv2*, aws_redshift*, aws_scheduler* from aws-table-list.ts', () => {
		const filterRegEx = ['aws_wafv2*', 'aws_redshift*', 'aws_scheduler*'];
		const result = filterAllowedTables(awsTables, filterRegEx);
		expect(result).toEqual(
			expect.arrayContaining([
				'aws_wafv2_ipsets',
				'aws_wafv2_managed_rule_groups',
				'aws_wafv2_regex_pattern_sets',
				'aws_wafv2_rule_groups',
				'aws_wafv2_web_acls',
				'aws_redshift_cluster_parameter_groups',
				'aws_redshift_cluster_parameters',
				'aws_redshift_clusters',
				'aws_redshift_data_shares',
				'aws_redshift_endpoint_access',
				'aws_redshift_endpoint_accesses',
				'aws_redshift_endpoint_authorization',
				'aws_redshift_endpoint_authorizations',
				'aws_redshift_event_subscriptions',
				'aws_redshift_events',
				'aws_redshift_reserved_nodes',
				'aws_redshift_snapshots',
				'aws_redshift_subnet_groups',
				'aws_scheduler_schedule_groups',
			]),
		);
	});
});
