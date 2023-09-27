#!/usr/bin/env bash

set -e

migrateDEV() {
  source ../../.env

  export DATABASE_URL="postgresql://$LOCAL_DB_USER:$LOCAL_DB_PASSWORD@$LOCAL_DB_HOSTNAME:$LOCAL_DB_PORT/postgres"

  # clear existing local migrations table (if applicable)
  # and apply all migrations
  npx prisma migrate reset --force --schema "prisma/schema.prisma"
}

migrateCODE() {
  echo "Migrating CODE"
}

migratePROD() {
  echo "Migrating PROD"
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