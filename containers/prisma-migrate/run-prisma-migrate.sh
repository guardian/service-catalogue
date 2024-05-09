#!/bin/bash

set -e

echo 'Retrieving Prisma artifact from S3'
aws s3 cp "s3://$ARTIFACT_BUCKET/$PRISMA_ARTIFACT_KEY" ./prisma/

echo 'Unzipping Prisma artifact'
unzip -q prisma/prisma.zip

DB_PORT=5432
export DATABASE_URL=postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres

echo 'Running prisma migrate deploy'
/usr/src/app/node_modules/.bin/prisma migrate deploy