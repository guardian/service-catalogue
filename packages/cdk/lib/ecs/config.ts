import { GuardianOrganisationalUnits } from '@guardian/private-infrastructure-config';
import { Versions } from './versions';

export interface CloudqueryConfig {
	kind: 'source' | 'destination';
	spec: Record<string, unknown>;
}

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
				connection_string: [
					'user=postgres',
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
