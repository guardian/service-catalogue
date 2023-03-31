#!/usr/bin/env bash

set -e

# NOTE: The `RDS_HOST` env var is set in userdata

# Generate temp credentials
export PG_PASSWORD="$(aws rds generate-db-auth-token --hostname $RDS_HOST --port 5432 --region eu-west-1 --username cloudquery)"

# Build connection string
# See https://www.postgresql.org/docs/11/libpq-connect.html#LIBPQ-CONNECT-SSLMODE for sslmode options
export PG_CONNECTION_STRING="postgresql://cloudquery:$PG_PASSWORD@$RDS_HOST:5432/postgres?sslmode=verify-full"

# Run cloudquery
/cloudquery --log-format json --log-console sync /aws.yaml /postgresql.yaml
