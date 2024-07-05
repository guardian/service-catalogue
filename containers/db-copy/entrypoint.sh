#!/bin/ash

set -e

if [[ -z "$TABLES" ]]; then
  echo "TABLES environment variable is not set. Nothing to do."
  exit 0
fi

# TODO Use RDS IAM Authentication in favour of the root credentials
getCodeDatabaseUrl() {
  SECRET_NAME=$(aws secretsmanager list-secrets --filters Key=tag-value,Values=CODE | jq -r '.SecretList[].Name' | grep Postgres)

  SECRET_STRING=$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" | jq '.SecretString | fromjson')

  CODE_DATABASE_USER=$(echo "$SECRET_STRING" | jq -r '.username')
  CODE_DATABASE_PASSWORD=$(echo "$SECRET_STRING" | jq -r '.password')
  CODE_DATABASE_HOSTNAME=$(echo "$SECRET_STRING" | jq -r '.host')
  CODE_DATABASE_PORT=$(echo "$SECRET_STRING" | jq -r '.port')

  # This value is not in the AWS Secret Manager resource.
  # This is likely because we've not explicitly set the `databaseName` property in the infrastructure,
  # and therefore the default value of "postgres" is used.
  # See:
  #   - https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds.DatabaseInstance.html#databasename
  #   - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbinstance.html#cfn-rds-dbinstance-dbname
  CODE_DATABASE_NAME=postgres

  CODE_DATABASE_URL=postgres://${CODE_DATABASE_USER}:${CODE_DATABASE_PASSWORD}@${CODE_DATABASE_HOSTNAME}:${CODE_DATABASE_PORT}/${CODE_DATABASE_NAME}

  echo "$CODE_DATABASE_URL"
}

REMOTE_URL=$(getCodeDatabaseUrl)

tables_to_copy=$(echo "$TABLES" | tr "-" "\n")
for tbl in $tables_to_copy; do
  echo "Dumping table $tbl to /sql/$tbl.sql"
  # We use --data-only here as unfortunately pg_dump does not have a --create-if-not-exists to stop it from
  # erroring when it tries to dump a table that prisma has already created.
  pg_dump "$REMOTE_URL" -t "$tbl" -f "/sql/$tbl.sql" --no-owner --no-privileges --column-inserts --data-only
done
