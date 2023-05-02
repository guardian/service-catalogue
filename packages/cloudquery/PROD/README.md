# CloudQuery PROD
This directory includes configuration for running CloudQuery in production.

We currently have CloudQuery [running on EC2](../../cdk/lib/cloudquery.ts), running `cloudquery sync` once a day via a [systemd timer](cloudquery.timer).

## [Sources](https://www.cloudquery.io/docs/plugins/sources/overview)
We have the following sources configured:
- [AWS](aws.yaml)

## [Destinations](https://www.cloudquery.io/docs/plugins/destinations/overview)
We have the following destinations configured:
- [RDS Postgres](postgresql.yaml). CloudQuery connects to RDS Postgres via IAM Authentication.

## Visualising
Grafana is configured with read-only access to the database.
