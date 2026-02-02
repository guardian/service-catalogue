# CloudQuery

Following the [ADR(/proposal)](../ADR/02-cloudquery.md),
and since PRs [#202](https://github.com/guardian/service-catalogue/pull/202) and [#212](https://github.com/guardian/service-catalogue/pull/212),
this repository can be viewed as a set of CloudQuery configuration.

## Implementation

We are using CloudQuery to collect data from:

- AWS
- GitHub
- Fastly
- Galaxies of the Guardian
- Image packages

As it is relatively easy collect data with CloudQuery, we have, largely, opted to collect _all_ the data.
By collecting this extra data, we enable others to answer their questions. For example:

- Which of our EC2 apps still have port 22 open?
- Which of our S3 buckets are publicly available?
- I'm having trouble with a particular AWS service, who else is using it?
- How many break-glass users do we have?

We have implemented CloudQuery to run on AWS ECS,
writing data to [Postgres](https://www.cloudquery.io/docs/plugins/destinations/postgresql/overview).
This is all [defined using GuCDK](../packages/cdk/lib/cloudquery/index.ts).

We have more interest in some data sources than others.
For example, we'd like to know more about AWS Lambdas across the estate than AWS Elastic Beanstalk deployments.
For this reason, we have a number of ECS tasks, each running on their own schedule.

### Postgres

Each ECS task authenticates with Postgres using [IAM Authentication](https://repost.aws/knowledge-center/rds-postgresql-connect-using-iam).

The root (sudo) user is not used. Instead, we manually created a user:

```sql
-- Create user for CloudQuery, and grant RDS IAM authentication.
-- See https://repost.aws/knowledge-center/rds-postgresql-connect-using-iam
CREATE USER cloudquery;
GRANT rds_iam TO cloudquery;
```

### Grafana

We're using [Grafana](https://metrics.gutools.co.uk/) to create dashboards, joining data across the above sources.
We have connected Grafana with _read-only access_ to the Postgres database.

Unfortunately, Grafana does not support IAM authentication.
We have manually created a user for Grafana with static credentials:

```sql
-- Create users for Grafana CODE and PROD, with readonly access.
-- See https://grafana.com/docs/grafana/latest/datasources/postgres/#database-user-permissions-important

-- Unfortunately Grafana does not support RDS IAM authentication.
-- See https://github.com/grafana/grafana/discussions/48170
CREATE USER grafanareadercode WITH PASSWORD 'REDACTED';
GRANT USAGE ON SCHEMA public TO grafanareadercode;

CREATE USER grafanareaderprod WITH PASSWORD 'REDACTED';
GRANT USAGE ON SCHEMA public TO grafanareaderprod;

-- Provide Grafana with access to any new tables and views as soon as they're created.
SET ROLE cloudquery;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO grafanareadercode;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO grafanareaderprod;
```

## API Key
We use a separate API key per each environment, storing them in [AWS Secrets Manager](../packages/cdk/lib/cloudquery/api-key.ts).

### Rotating
To use paid plugins, such as the [AWS plugin](https://hub.cloudquery.io/plugins/source/cloudquery/aws/latest/docs), an API key must be used. 
We typically set the API key to expire every year[^1].

To rotate it:
1. [Generate a new API key](https://docs.cloudquery.io/docs/managing-cloudquery/deployments/generate-api-key) for CODE (naming scheme is typically `service-catalogue-<STAGE>-exp-<MONTH>-<YEAR>`)
2. Update the value in [AWS Secrets Manager](https://eu-west-1.console.aws.amazon.com/secretsmanager/secret?name=%2FCODE%2Fdeploy%2Fservice-catalogue%2Fcloudquery-api-key&region=eu-west-1)
3. [Run an ECS task](../packages/cli/README.md) to verify CODE still works:

    ```bash
    npm -w cli start -- run-task --stage CODE --name AwsOrgWideS3
    ```

4. [Generate a new API key](https://docs.cloudquery.io/docs/managing-cloudquery/deployments/generate-api-key) for PROD
5. Update the value in [AWS Secrets Manager](https://eu-west-1.console.aws.amazon.com/secretsmanager/secret?name=%2FPROD%2Fdeploy%2Fservice-catalogue%2Fcloudquery-api-key&region=eu-west-1)
6. The following day, provided CloudQuery successfully synced data, remove the old API keys from CloudQuery.

[^1]: You should receive an email from CloudQuery reminding you to rotate the key. We've also created a repeated event in calendar.