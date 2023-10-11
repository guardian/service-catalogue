#!/usr/bin/env bash

set -e

red='\x1B[0;31m'
bold='\x1B[1m'
plain='\x1B[0m'

devSetup() {
  echo -e "${bold}Setting up local DATABASE_URL and resetting migrations${plain}"
  source ../../.env
  export DATABASE_URL="postgresql://$LOCAL_DB_USER:$LOCAL_DB_PASSWORD@$LOCAL_DB_HOSTNAME:$LOCAL_DB_PORT/postgres"
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
  db_usermigration_name=$(jq -r '.[] | .usermigration_name' <<< "$dbSecretJson")
  db_password=$(jq -r '.[] | .password' <<< "$dbSecretJson")
  db_host=$(jq -r '.[] | .host' <<< "$dbSecretJson")
  db_port=$(jq -r '.[] | .port' <<< "$dbSecretJson")

  export DATABASE_URL="postgresql://$db_usermigration_name:$db_password@$db_host:$db_port/postgres"
}

note="NOTE: You need to be on the VPN to migrate. \nMigration may fail if the table(s) already exist in the database.\nSee https://www.prisma.io/docs/guides/migrate/production-troubleshooting#failed-migration for how to fix."

continueQuery() {
  stage=$1
  echo -e "${bold}Do you want to continue (y/n)?${plain}"
    read -r answer
    if [ "$answer" != "${answer#[Yy]}" ] ;then
        echo "$stage migration in progress..."
        getDbUrl "$stage"
        npx prisma migrate deploy
    else
        echo "Exiting without migrating, goodbye."
        return
    fi
}

migrateCODE() {
  echo -e "$note"
  echo -e "${red}WARNING: Changes made on your local machine will affect Service Catalogue CODE data.${plain}"
  continueQuery "CODE"
}

migratePROD() {
  echo -e "$note"
  echo -e "${red}${bold}WARNING: You are in PROD mode! ${plain}${red}Changes made on your local machine will affect Service Catalogue PROD data.${plain}"
  continueQuery "PROD"
}

# Read in input stage(s)
stage=$1
migration_name=$2

if [ "$stage" == "--dev" ]
then
  devSetup
  if [ -n "$migration_name" ]
  then
    migrateDEV "$migration_name"
  else
    :
  fi
elif [ "$stage" == "--code" ]
then
  migrateCODE
elif [ "$stage" == "--prod" ]
then
  migratePROD
else
  echo -e "Stage '$stage' not recognised, please try again."
fi