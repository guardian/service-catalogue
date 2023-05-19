import { GuardianAwsAccounts } from '@guardian/private-infrastructure-config';
import { dump } from 'js-yaml';
import {
	awsSourceConfigForAccount,
	awsSourceConfigForOrganisation,
	postgresDestinationConfig,
} from './config';

describe('Config generation, and converting to YAML', () => {
	it('Should create a destination configuration', () => {
		const config = postgresDestinationConfig();
		expect(dump(config)).toMatchInlineSnapshot(`
		"kind: destination
		spec:
		  name: postgresql
		  registry: github
		  path: cloudquery/postgresql
		  version: v4.1.0
		  migrate_mode: forced
		  spec:
		    connection_string: >-
		      user=postgres password=\${DB_PASSWORD} host=\${DB_HOST} port=5432
		      dbname=postgres sslmode=disable
		"
	`);
	});

	it('Should create an AWS source configuration for the organisation', () => {
		const config = awsSourceConfigForOrganisation({
			tables: ['aws_s3_buckets'],
		});
		expect(dump(config)).toMatchInlineSnapshot(`
		"kind: source
		spec:
		  name: aws
		  path: cloudquery/aws
		  version: v17.0.0
		  tables:
		    - aws_s3_buckets
		  destinations:
		    - postgresql
		  spec:
		    regions:
		      - eu-west-1
		      - eu-west-2
		      - us-east-1
		      - us-east-2
		      - us-west-1
		      - ap-southeast-2
		      - ca-central-1
		    org:
		      member_role_name: cloudquery-access
		      organization_units:
		        - ou-123
		"
	`);
	});

	it('Should create an AWS source configuration with skipped tables for the organisation', () => {
		const config = awsSourceConfigForOrganisation({
			tables: ['*'],
			skipTables: ['aws_s3_buckets'],
		});
		expect(dump(config)).toMatchInlineSnapshot(`
		"kind: source
		spec:
		  name: aws
		  path: cloudquery/aws
		  version: v17.0.0
		  tables:
		    - '*'
		  skip_tables:
		    - aws_s3_buckets
		  destinations:
		    - postgresql
		  spec:
		    regions:
		      - eu-west-1
		      - eu-west-2
		      - us-east-1
		      - us-east-2
		      - us-west-1
		      - ap-southeast-2
		      - ca-central-1
		    org:
		      member_role_name: cloudquery-access
		      organization_units:
		        - ou-123
		"
	`);
	});

	it('Should create an AWS source configuration for a single account', () => {
		const config = awsSourceConfigForAccount(GuardianAwsAccounts.Security, {
			tables: [
				'aws_accessanalyzer_analyzers',
				'aws_accessanalyzer_analyzer_archive_rules',
				'aws_accessanalyzer_analyzer_findings',
			],
		});
		expect(dump(config)).toMatchInlineSnapshot(`
		"kind: source
		spec:
		  name: aws
		  path: cloudquery/aws
		  version: v17.0.0
		  tables:
		    - aws_accessanalyzer_analyzers
		    - aws_accessanalyzer_analyzer_archive_rules
		    - aws_accessanalyzer_analyzer_findings
		  destinations:
		    - postgresql
		  spec:
		    regions:
		      - eu-west-1
		      - eu-west-2
		      - us-east-1
		      - us-east-2
		      - us-west-1
		      - ap-southeast-2
		      - ca-central-1
		    accounts:
		      - id: cq-for-000000000015
		        role_arn: arn:aws:iam::000000000015:role/cloudquery-access
		"
	`);
	});
});
