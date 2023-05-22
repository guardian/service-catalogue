import { GuardianOrganisationalUnits } from '@guardian/private-infrastructure-config';
import { Versions } from './versions';

export type CloudqueryConfig = Record<string, unknown>;

interface CloudqueryTableConfig {
	tables?: string[];
	skipTables?: string[];
}

/**
 * Create a CloudQuery destination configuration for Postgres.
 */
export function postgresDestinationConfig(): CloudqueryConfig {
	return {
		kind: 'destination',
		spec: {
			name: 'postgresql',
			registry: 'github',
			path: 'cloudquery/postgresql',
			version: `v${Versions.CloudqueryPostgres}`,
			migrate_mode: 'forced',
			spec: {
				connection_string: '${file:/var/scratch/connection_string}',
			},
		},
	};
}

export function awsSourceConfig(
	tableConfig: CloudqueryTableConfig,
	extraConfig: Record<string, unknown> = {},
): CloudqueryConfig {
	const { tables, skipTables } = tableConfig;

	if (!tables && !skipTables) {
		throw new Error('Must specify either tables or skipTables');
	}

	return {
		kind: 'source',
		spec: {
			name: 'aws',
			path: 'cloudquery/aws',
			version: `v${Versions.CloudqueryAws}`,
			tables,
			skip_tables: skipTables,
			destinations: ['postgresql'],
			spec: {
				regions: [
					// All regions we support.
					// See https://github.com/guardian/infosec-platform/blob/main/policies/DenyAccessToNonApprovedRegions.json
					'eu-west-1',
					'eu-west-2',
					'us-east-1',
					'us-east-2',
					'us-west-1',
					'ap-southeast-2',
					'ca-central-1',
				],
				...extraConfig,
			},
		},
	};
}

/**
 * Create a CloudQuery configuration for all AWS accounts in the organisation.
 * @param tableConfig Which tables to include or exclude.
 *
 * @see https://www.cloudquery.io/docs/plugins/sources/aws/configuration#org
 */
export function awsSourceConfigForOrganisation(
	tableConfig: CloudqueryTableConfig,
): CloudqueryConfig {
	return awsSourceConfig(tableConfig, {
		org: {
			// See: https://github.com/guardian/aws-account-setup/pull/58
			member_role_name: 'cloudquery-access',
			organization_units: [GuardianOrganisationalUnits.Root],
		},
	});
}

/**
 * Create a CloudQuery configuration for a single AWS account.
 * Use this for those services running across the organisation which are aggregated in a single account.
 * For example, Access Analyzer.
 *
 * @param accountNumber The AWS account to query. CloudQuery will assume the role `cloudquery-access` in this account.
 * @param tableConfig Which tables to include or exclude.
 *
 * @see https://www.cloudquery.io/docs/plugins/sources/aws/configuration#account
 */
export function awsSourceConfigForAccount(
	accountNumber: string,
	tableConfig: CloudqueryTableConfig,
): CloudqueryConfig {
	return awsSourceConfig(tableConfig, {
		accounts: [
			{
				id: `cq-for-${accountNumber}`,
				role_arn: `arn:aws:iam::${accountNumber}:role/cloudquery-access`,
			},
		],
	});
}

// Tables we are skipping because they are slow and or uninteresting to us.
export const skipTables = [
	'aws_ec2_vpc_endpoint_services', // this resource includes services that are available from AWS as well as other AWS Accounts
	'aws_cloudtrail_events',
	'aws_docdb_cluster_parameter_groups',
	'aws_docdb_engine_versions',
	'aws_ec2_instance_types',
	'aws_elasticache_engine_versions',
	'aws_elasticache_parameter_groups',
	'aws_elasticache_reserved_cache_nodes_offerings',
	'aws_elasticache_service_updates',
	'aws_neptune_cluster_parameter_groups',
	'aws_neptune_db_parameter_groups',
	'aws_rds_cluster_parameter_groups',
	'aws_rds_db_parameter_groups',
	'aws_rds_engine_versions',
	'aws_servicequotas_services',
	'aws_identitystore_users',
	'aws_identitystore_groups',
	'aws_quicksight_data_sets',
	'aws_quicksight_dashboards',
	'aws_quicksight_analyses',
	'aws_quicksight_users',
	'aws_quicksight_templates',
	'aws_quicksight_groups',
	'aws_quicksight_folders',
	'aws_quicksight_data_sources',
	'aws_amp_workspaces',
	'aws_ssoadmin_instances',
	'aws_glue_connections',
	'aws_computeoptimizer_ecs_service_recommendations',
	'aws_xray_sampling_rules',
	'aws_xray_resource_policies',
	'aws_xray_groups',
];
