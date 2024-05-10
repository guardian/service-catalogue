#!/bin/bash

set -e

echo 'Run run-prisma-migrate.sh'

echo 'Step 1: Retrieving Prisma artifact from S3'
aws s3 cp "s3://$ARTIFACT_BUCKET/$PRISMA_ARTIFACT_KEY" ./prisma/

echo 'Step 2: Unzipping Prisma artifact'
unzip -q prisma/prisma.zip

DB_PORT=5432
export DATABASE_URL=postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres

echo 'where is prisma'
which prisma

echo 'Step 3: Running prisma migrate deploy'
./node_modules/.bin/prisma migrate deploy