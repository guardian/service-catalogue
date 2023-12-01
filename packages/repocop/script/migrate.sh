#!/usr/bin/env bash

set -e

red='\x1B[0;31m'
bold='\x1B[1m'
plain='\x1B[0m'

devSetup() {
  echo -e "${bold}Setting up local DATABASE_URL and resetting migrations${plain}"
  source ../../.env
  export DATABASE_URL="postgresql://$DATABASE_USER:$DATABASE_PASSWORD@$DATABASE_HOSTNAME:$DATABASE_PORT/postgres"
  # clear existing local migrations table (if applicable)
  # and apply all migrations
  npx prisma migrate reset --force --schema "prisma/schema.prisma"
}

migrateDEV() {
  migration_name=$1
  echo -e "${bold}Creating migration $migration_name${plain}"
  npx prisma migrate dev --name "$migration_name"
}

getDbUrl() {
  stage=$1
  allSecrets=$(aws secretsmanager list-secrets --profile deployTools --region eu-west-1 | jq '.SecretList')
  secret_id=$(jq -r --arg stage "$stage" '.[] | select(.Tags[] as $t | any($t.Key=="Stack" and $t.Value=="deploy")) | select(.Tags[] as $t | any($t.Key=="Stage" and $t.Value==$stage)) | select(.Tags[] as $t | any($t.Key=="App" and $t.Value=="service-catalogue")) | select(.Name | test("PostgresInstance")) | .Name' <<< "$allSecrets")
  dbSecretJson=$(aws secretsmanager get-secret-value --secret-id "$secret_id" --profile deployTools --region eu-west-1 | jq -c '[.SecretString | fromjson]')
  db_username=$(jq -r '.[] | .username' <<< "$dbSecretJson")
  db_password=$(jq -r '.[] | .password' <<< "$dbSecretJson")
  db_host=$(jq -r '.[] | .host' <<< "$dbSecretJson")
  db_port=$(jq -r '.[] | .port' <<< "$dbSecretJson")

  export DATABASE_URL="postgresql://$db_username:$db_password@$db_host:$db_port/postgres"
}

note="NOTE: You need to be on the VPN to migrate. \nMigration may fail if the table(s) already exist in the database.\nSee https://www.prisma.io/docs/guides/migrate/production-troubleshooting#failed-migration for how to fix."

continueMigrate() {
  stage=$1
  echo -e "${bold}Do you want to continue (y/n)? (No is default)${plain}"
    read -r answer
    if [ "$answer" != "${answer#[Yy]}" ] ;then
        echo "$stage migration in progress..."
        getDbUrl "$stage"

        if [ "$migration_name" == "--from-start" ]; then
          echo "Migrating from the very start. This requires the _prisma_migrations table to not exist, and will fail if it does."

          # Baseline the database
          # See https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/add-prisma-migrate-to-a-project#baseline-your-production-environment
          npx prisma migrate resolve --applied 0_init
        fi

        # Apply remaining migrations
        npx prisma migrate deploy
    else
        echo "Exiting without migrating, goodbye."
        return
    fi
}

migrateWarning() {
  stage=$1
  echo -e "${red}WARNING: Changes made on your local machine will affect Service Catalogue $stage data as all pending migrations will be applied.${plain}"
}

migrateDeploy() {
  stage=$1
  echo -e "$note"
  migrateWarning "$stage"
  continueMigrate "$stage" "$fromStart"
}

stageAwareMigration() {
  if [ "$stage" == "--dev" ]; then
    devSetup
    if [ -n "$migration_name" ]; then
      migrateDEV "$migration_name"
    fi
  elif [ "$stage" == "--code" ]; then
    migrateDeploy "CODE" "$migration_name"
  elif [ "$stage" == "--prod" ]; then
    migrateDeploy "PROD" "$migration_name"
  else
    echo -e "Stage '$stage' not recognised, please try again."
  fi
}

(
stage=$1
migration_name=$2
  cd ../common
  stageAwareMigration "$stage" "$migration_name"
)
