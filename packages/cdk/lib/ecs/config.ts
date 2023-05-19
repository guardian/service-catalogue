import { GuardianOrganisationalUnits } from '@guardian/private-infrastructure-config';
import { dump } from 'js-yaml';

export function destinationConfig() {
	const config = {
		kind: 'destination',
		spec: {
			name: 'postgresql',
			registry: 'github',
			path: 'cloudquery/postgresql',
			version: 'v4.1.0',
			migrate_mode: 'forced',
			spec: {
				connection_string: [
					'user=postgres',
					'password=${DB_PASSWORD}',
					'host=${DB_HOST}',
					'port=5432',
					'dbname=postgres',
					'sslmode=disable',
				].join(' '),
			},
		},
	};
	return dump(config);
}

export function awsSourceConfig(tables: string[]) {
	const config = {
		kind: 'source',
		spec: {
			name: 'aws',
			path: 'cloudquery/aws',
			version: 'v17.0.0',
			tables,
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
				org: {
					// See: https://github.com/guardian/aws-account-setup/pull/58
					member_role_name: 'cloudquery-access',
					organization_units: [GuardianOrganisationalUnits.Root],
				},
			},
		},
	};
	return dump(config);
}
