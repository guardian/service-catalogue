import { GuardianOrganisationalUnits } from '@guardian/private-infrastructure-config';
import { Versions } from './versions';

export type CloudqueryConfig = {
	spec: {
		tables?: string[];
		[k: string]: unknown;
	};
	[k: string]: unknown;
};

interface CloudqueryTableConfig {
	tables?: string[];
	skipTables?: string[];
	concurrency?: number;
	usePaidApis?: boolean;
}

interface GitHubCloudqueryTableConfig extends CloudqueryTableConfig {
	org: string;
}

/**
 * Create a ServiceCatalogue destination configuration for Postgres.
 */
export function postgresDestinationConfig(): CloudqueryConfig {
	return {
		kind: 'destination',
		spec: {
			name: 'postgresql',
			registry: 'github',
			path: 'cloudquery/postgresql',
			version: `v${Versions.CloudqueryPostgresDestination}`,
			migrate_mode: 'forced',
			spec: {
				connection_string: [
					'user=${DB_USERNAME}',
					'password=${DB_PASSWORD}',
					'host=${DB_HOST}',
					'port=5432',
					'dbname=postgres',
					'sslmode=verify-full',
				].join(' '),
			},
		},
	};
}

export function awsSourceConfig(
	tableConfig: CloudqueryTableConfig,
	extraConfig: Record<string, unknown> = {},
): CloudqueryConfig {
	const { tables, skipTables, concurrency, usePaidApis } = tableConfig;

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
			skip_dependent_tables: false,
			skip_tables: skipTables,
			destinations: ['postgresql'],
			otel_endpoint: '0.0.0.0:4318',
			otel_endpoint_insecure: true,
			spec: {
				concurrency,
				use_paid_apis: usePaidApis,
				...extraConfig,
			},
		},
	};
}

/**
 * Create a ServiceCatalogue configuration for all AWS accounts in the organisation.
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
 * Create a ServiceCatalogue configuration for a single AWS account.
 * Use this for those services running across the organisation which are aggregated in a single account.
 * For example, Access Analyzer.
 *
 * @param accountNumber The AWS account to query. ServiceCatalogue will assume the role `cloudquery-access` in this account.
 * @param tableConfig Which tables to include or exclude.
 * @param extraConfig Extra spec fields.
 * @see https://www.cloudquery.io/docs/plugins/sources/aws/configuration#account
 */
export function awsSourceConfigForAccount(
	accountNumber: string,
	tableConfig: CloudqueryTableConfig,
	extraConfig: Record<string, unknown> = {},
): CloudqueryConfig {
	return awsSourceConfig(tableConfig, {
		accounts: [
			{
				id: `cq-for-${accountNumber}`,
				role_arn: `arn:aws:iam::${accountNumber}:role/cloudquery-access`,
			},
		],
		...extraConfig,
	});
}

export function githubSourceConfig(
	tableConfig: GitHubCloudqueryTableConfig,
): CloudqueryConfig {
	const { tables, skipTables, org } = tableConfig;

	if (!tables && !skipTables) {
		throw new Error('Must specify either tables or skipTables');
	}

	return {
		kind: 'source',
		spec: {
			name: 'github',
			path: 'cloudquery/github',
			version: `v${Versions.CloudqueryGithub}`,
			tables,
			skip_dependent_tables: false,
			skip_tables: skipTables,
			destinations: ['postgresql'],
			spec: {
				concurrency: 1000, // TODO what's the ideal value here?!
				orgs: [org],
				app_auth: [
					{
						org,

						// For simplicity, read all configuration from disk.
						private_key_path: `${serviceCatalogueConfigDirectory}/github-private-key`,
						app_id:
							'${' +
							`file:${serviceCatalogueConfigDirectory}/github-app-id` +
							'}',
						installation_id:
							'${' +
							`file:${serviceCatalogueConfigDirectory}/github-installation-id` +
							'}',
					},
				],
				include_archived_repos: true,
			},
		},
	};
}

/**
 * Configuration for the Fastly source plugin.
 * @see https://www.cloudquery.io/docs/plugins/sources/fastly/overview#configuration
 */
export function fastlySourceConfig(
	tableConfig: CloudqueryTableConfig,
): CloudqueryConfig {
	const { tables, skipTables } = tableConfig;

	if (!tables && !skipTables) {
		throw new Error('Must specify either tables or skipTables');
	}

	return {
		kind: 'source',
		spec: {
			name: 'fastly',
			path: 'cloudquery/fastly',
			version: `v${Versions.CloudqueryFastly}`,
			tables,
			skip_dependent_tables: false,
			skip_tables: skipTables,
			destinations: ['postgresql'],

			spec: {
				// The Fastly API is rate limited to 1000 requests per hour.
				// See https://docs.fastly.com/en/guides/resource-limits#rate-and-time-limits.
				// TODO what's the ideal value here?!
				concurrency: 1000,
				fastly_api_key: '${FASTLY_API_KEY}',
			},
		},
	};
}

export function galaxiesSourceConfig(bucketName: string): CloudqueryConfig {
	return {
		kind: 'source',
		spec: {
			name: 'galaxies',
			path: 'guardian/galaxies',
			registry: 'github',
			version: `v${Versions.CloudqueryGalaxies}`,
			destinations: ['postgresql'],
			tables: [
				'galaxies_people_table',
				'galaxies_teams_table',
				'galaxies_streams_table',
				'galaxies_people_profile_info_table',
			],
			spec: {
				bucket: bucketName,
			},
		},
	};
}

export function ns1SourceConfig(): CloudqueryConfig {
	return {
		kind: 'source',
		spec: {
			name: 'ns1',
			registry: 'grpc',
			path: 'localhost:7777',

			// This property is required, but only relevant for GitHub hosted plugins.
			// Use a fake value to satisfy the config parser.
			// See https://docs.cloudquery.io/docs/reference/source-spec#version
			version: 'v0.0.0',
			tables: ['ns1_*'],
			destinations: ['postgresql'],
			spec: {
				apiKey: '${NS1_API_KEY}',
			},
		},
	};
}

export function riffraffSourcesConfig(): CloudqueryConfig {
	return {
		kind: 'source',
		spec: {
			name: 'postgresql',
			path: 'cloudquery/postgresql',
			version: `v${Versions.CloudqueryPostgresSource}`,
			destinations: ['postgresql'],
			tables: ['riffraff_*'],
			skip_tables: ['riffraff_deploy_logs'],
			spec: {
				connection_string: [
					'user=${RIFFRAFF_DB_USERNAME}',
					'password=${RIFFRAFF_DB_PASSWORD}',
					'host=${RIFFRAFF_DB_HOST}',
					'port=5432',
					'dbname=riffraff',
					'sslmode=verify-full',
				].join(' '),
			},
		},
	};
}

export function githubLanguagesConfig(): CloudqueryConfig {
	return {
		kind: 'source',
		spec: {
			name: 'github-languages',
			path: 'guardian/github-languages',
			version: `v${Versions.CloudqueryGithubLanguages}`,
			destinations: ['postgresql'],
			tables: ['github_languages'],
			registry: 'github',
		},
	};
}

export function amigoBakePackagesConfig(
	baseImagesTableName: string,
	recipesTableName: string,
	bakesTableName: string,
	packagesBucketName: string,
): CloudqueryConfig {
	return {
		kind: 'source',
		spec: {
			name: 'image-packages',
			registry: 'github',
			path: 'guardian/image-packages',
			version: `v${Versions.CloudqueryImagePackages}`,
			destinations: ['postgresql'],
			tables: ['amigo_bake_packages'],
			spec: {
				base_images_table: baseImagesTableName,
				recipes_table: recipesTableName,
				bakes_table: bakesTableName,
				bucket: packagesBucketName,
			},
		},
	};
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
	'aws_emr_supported_instance_types',
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
	// We don't really use Wellarchictected and it confuses our Tagging obligation
	// due to it having many resources managed by AWS without tags
	'aws_wellarchitected_*',

	// These appear to be heavily rate limited, and not too interesting (yet).
	// Don't collect them to reduce execution time.
	'aws_stepfunctions_map_runs',
	'aws_stepfunctions_map_run_executions',
	'aws_stepfunctions_executions',

	'aws_scheduler_schedules',
];

export const serviceCatalogueConfigDirectory = '/usr/share/cloudquery';
