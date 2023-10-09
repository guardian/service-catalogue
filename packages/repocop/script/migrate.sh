#!/usr/bin/env bash

set -e

migrateDEV() {
  source ../../.env

  export DATABASE_URL="postgresql://$LOCAL_DB_USER:$LOCAL_DB_PASSWORD@$LOCAL_DB_HOSTNAME:$LOCAL_DB_PORT/postgres"

  # clear existing local migrations table (if applicable)
  # and apply all migrations
  npx prisma migrate reset --force --schema "prisma/schema.prisma"
}

getDbUrl() {
  stage=$1
  echo "stage: $stage"
  allSecrets=$(aws secretsmanager list-secrets --profile deployTools --region eu-west-1 | jq '.SecretList')
  secret_id=$(jq -r --arg stage "$stage" '.[] | select(.Tags[] as $t | any($t.Key=="Stack" and $t.Value=="deploy")) | select(.Tags[] as $t | any($t.Key=="Stage" and $t.Value==$stage)) | select(.Tags[] as $t | any($t.Key=="App" and $t.Value=="service-catalogue")) | select(.Name | test("PostgresInstance")) | .Name' <<< "$allSecrets")
  dbSecretJson=$(aws secretsmanager get-secret-value --secret-id "$secret_id" --profile deployTools --region eu-west-1 | jq -c '[.SecretString | fromjson]')
  db_username=$(jq -r '.[] | .username' <<< "$dbSecretJson")
  db_password=$(jq -r '.[] | .password' <<< "$dbSecretJson")
  db_host=$(jq -r '.[] | .host' <<< "$dbSecretJson")
  db_port=$(jq -r '.[] | .port' <<< "$dbSecretJson")

  export DATABASE_URL="postgresql://$db_username:$db_password@$db_host:$db_port/postgres"
}

migrateCODE() {
  echo "Migrating CODE"
  getDbUrl 'CODE'
  # TODO: migrate
}

migratePROD() {
  echo "Migrating PROD"
  getDbUrl 'PROD'
  # TODO: migrate
}

# Read in input flag
stage=$1

if [ "$stage" == "--dev" ]
then
  migrateDEV
elif [ "$stage" == "--code" ]
then
  migrateCODE
elif [ "$stage" == "--prod" ]
then
  migratePROD
else
  echo -e "Stage '$stage' not recognised, please try again with either '--dev', '--code' or '--prod' flags"
fi