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

  CODE_DATABASE_URL=postgres://${CODE_DATABASE_USER}:${CODE_DATABASE_PASSWORD}@${CODE_DATABASE_HOSTNAME}:${CODE_DATABASE_PORT}/postgres

  echo "$CODE_DATABASE_URL"
}

REMOTE_URL=$(getCodeDatabaseUrl)

tables_to_copy=$(echo "$TABLES" | tr "-" "\n")
for tbl in $tables_to_copy; do
  echo "Dumping table $tbl to /sql/$tbl.sql"
  pg_dump "$REMOTE_URL" -t "$tbl" -f "/sql/$tbl.sql" --no-owner --no-privileges --inserts
done
