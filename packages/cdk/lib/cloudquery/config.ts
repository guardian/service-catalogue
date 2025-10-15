import { GuardianOrganisationalUnits } from '@guardian/aws-account-setup';
import { galaxiesTables } from './allow-list-tables/galaxies-table-list';
import { ns1Tables } from './allow-list-tables/ns1_table_list';
import { riffraffTables } from './allow-list-tables/riffraff-table-list';
import { Versions } from './versions';

export type CloudqueryConfig = {
	spec: {
		tables?: string[];
		[k: string]: unknown;
	};
	[k: string]: unknown;
};

interface CloudqueryTableConfig {
	/**
	 * The tables for CloudQuery to collect.
	 */
	tables: string[];
	concurrency?: number;
}

interface GitHubCloudqueryTableConfig extends CloudqueryTableConfig {
	org: string;
}

interface GitHubCloudqueryTableConfigForRepository
	extends CloudqueryTableConfig {
	/**
	 * The organisation to authenticate GitHub requests against.
	 * This organisation is tied to the GitHub App.
	 */
	org: string;

	/**
	 * The repositories to query.
	 * These repositories should belong to the `org` and follow the format `<org>/<repo>`.
	 */
	repositories: string[];
}

/**
 * Specifies the update method to use when inserting rows to Postgres.
 *
 * @see https://cli-docs.cloudquery.io/docs/reference/destination-spec#write_mode
 */
export enum CloudqueryWriteMode {
	/**
	 * Overwrite existing rows with the same primary key, and delete rows that are no longer present in the cloud.
	 */
	OverwriteDeleteStale = 'overwrite-delete-stale',

	/**
	 * Same as {@link CloudqueryWriteMode.OverwriteDeleteStale}, but doesn't delete stale rows from previous syncs.
	 */
	Overwrite = 'overwrite',

	/**
	 * Rows are never overwritten or deleted, only appended.
	 */
	Append = 'append',
}

/**
 * Create a ServiceCatalogue destination configuration for Postgres.
 */
export function postgresDestinationConfig(
	writeMode: CloudqueryWriteMode,
): CloudqueryConfig {
	return {
		kind: 'destination',
		spec: {
			name: 'postgresql',
			registry: 'github',
			path: 'cloudquery/postgresql',
			version: `v${Versions.CloudqueryPostgresDestination}`,
			write_mode: writeMode,
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
	const { tables, concurrency } = tableConfig;

	return {
		kind: 'source',
		spec: {
			name: 'aws',
			path: 'cloudquery/aws',
			version: `v${Versions.CloudqueryAws}`,
			tables,
			skip_dependent_tables: true,
			destinations: ['postgresql'],
			otel_endpoint: '0.0.0.0:4318',
			otel_endpoint_insecure: true,
			spec: {
				concurrency,
				...extraConfig,
			},
		},
	};
}

/**
 * Create a ServiceCatalogue configuration for all AWS accounts in the organisation.
 * @param tableConfig Which tables to include or exclude.
 * @param extraConfig Extra spec fields.
 * @see https://www.cloudquery.io/docs/plugins/sources/aws/configuration#org
 */
export function awsSourceConfigForOrganisation(
	tableConfig: CloudqueryTableConfig,
	extraConfig: Record<string, unknown> = {},
): CloudqueryConfig {
	return awsSourceConfig(tableConfig, {
		org: {
			// See: https://github.com/guardian/aws-account-setup/pull/58
			member_role_name: 'cloudquery-access',
			organization_units: [GuardianOrganisationalUnits.Root],
		},
		...extraConfig,
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
	const { tables, org } = tableConfig;

	return {
		kind: 'source',
		spec: {
			name: 'github',
			path: 'cloudquery/github',
			version: `v${Versions.CloudqueryGithub}`,
			tables,
			skip_dependent_tables: true,
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

export function githubSourceConfigForRepository(
	tableConfig: GitHubCloudqueryTableConfigForRepository,
): CloudqueryConfig {
	const { tables, org, repositories } = tableConfig;

	return {
		kind: 'source',
		spec: {
			name: 'github',
			path: 'cloudquery/github',
			version: `v${Versions.CloudqueryGithub}`,
			tables,
			skip_dependent_tables: true,
			destinations: ['postgresql'],
			spec: {
				repos: repositories,
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
				include_archived_repos: false,
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
	const { tables } = tableConfig;

	return {
		kind: 'source',
		spec: {
			name: 'fastly',
			path: 'cloudquery/fastly',
			version: `v${Versions.CloudqueryFastly}`,
			tables,
			skip_dependent_tables: true,
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

export function endOfLifeSourceConfig(): CloudqueryConfig {
	return {
		kind: 'source',
		spec: {
			name: 'endoflife',
			path: 'cloudquery/endoflife',
			registry: 'cloudquery',
			version: `v${Versions.CloudqueryEndOfLife}`,
			tables: ['endoflife_products'],
			destinations: ['postgresql'],
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
			tables: galaxiesTables,
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
			tables: ns1Tables,
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
			tables: riffraffTables,
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

export function githubLanguagesConfig(
	tableConfig: GitHubCloudqueryTableConfig,
): CloudqueryConfig {
	const { tables, org } = tableConfig;

	return {
		kind: 'source',
		spec: {
			name: 'github-languages',
			path: 'guardian/github-languages',
			version: `v${Versions.CloudqueryGithubLanguages}`,
			destinations: ['postgresql'],
			tables,
			registry: 'github',
			spec: {
				org,
				private_key_path: `${serviceCatalogueConfigDirectory}/github-private-key`,
				app_id:
					'${' + `file:${serviceCatalogueConfigDirectory}/github-app-id` + '}',
				installation_id:
					'${' +
					`file:${serviceCatalogueConfigDirectory}/github-installation-id` +
					'}',
			},
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

export const serviceCatalogueConfigDirectory = '/usr/share/cloudquery';
