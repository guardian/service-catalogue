import { awsSourceConfig, destinationConfig } from './config';

describe('Config generation', () => {
	it('Should create a destination configuration', () => {
		const config = destinationConfig();
		expect(config).toMatchInlineSnapshot(`
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

	it('Should create an AWS source configuration', () => {
		const config = awsSourceConfig(['aws_s3_buckets']);
		expect(config).toMatchInlineSnapshot(`
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
		"
	`);
	});
});
