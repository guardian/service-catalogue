#!/usr/bin/env bash

set -e
# This is created in the Cloudformation
# TODO: At the moment this is hard-coded, but if we want multiple stages in the future we would need to change this
SSM_PATH=/INFRA/deploy/cloudquery/database/endpoint-address

# This function will generate a connection string to the RDS database, with a temporary password that expires after 15 minutes.
issueRdsAuthToken() {
  # Get the address of the postgres instance endpoint from SSM, because it's more secure and future-proof
  RDS_HOST="$(aws ssm get-parameter --name $SSM_PATH --region eu-west-1 | jq .Parameter.Value -r)"

  # Generate temp credentials
  PG_PASSWORD="$(aws rds generate-db-auth-token --hostname $RDS_HOST --port 5432 --region eu-west-1 --username cloudquery)"

  # Build connection string on disk for CloudQuery to read
  # See `postgresql.yaml`
  # See https://www.postgresql.org/docs/11/libpq-connect.html#LIBPQ-CONNECT-SSLMODE for sslmode options
  # See https://www.cloudquery.io/docs/advanced-topics/environment-variable-substitution
  echo "user=cloudquery password=$PG_PASSWORD host=$RDS_HOST port=5432 dbname=postgres sslmode=verify-full" > /opt/cloudquery/connection_string
}

issueRdsAuthToken
/opt/cloudquery/cloudquery \
  --log-format json \
  --log-console \
  sync \
  /opt/cloudquery/aws.yaml \
  /opt/cloudquery/postgresql.yaml

# It's likely the RDS token has now expired, so create a new one before the next sync.
issueRdsAuthToken
/opt/cloudquery/cloudquery \
  --log-format json \
  --log-console \
  sync \
  /opt/cloudquery/template-summary.yaml \
  /opt/cloudquery/postgresql.yaml
