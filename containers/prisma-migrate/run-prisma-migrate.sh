#!/bin/bash

set -e

# This must match the WORKDIR in the Dockerfile
ROOT_DIR=/usr/src/app

echo 'Retrieving Prisma artifact from S3'
aws s3 cp "s3://$ARTIFACT_BUCKET/$PRISMA_ARTIFACT_KEY" "${ROOT_DIR}/prisma/"

echo 'Unzipping Prisma artifact'
unzip -q "${ROOT_DIR}/prisma/prisma.zip"

DB_PORT=5432
export DATABASE_URL=postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres

echo 'Running prisma migrate deploy'
"${ROOT_DIR}/node_modules/.bin/prisma" migrate deploy
