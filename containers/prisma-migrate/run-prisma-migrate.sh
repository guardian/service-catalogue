#!/bin/bash

set -e

ROOT_DIR=/usr/src/app

# This path needs to be writable
ARTIFACT_FILE="${ROOT_DIR}/prisma/prisma.zip"

echo 'Retrieving Prisma artifact from S3'
aws s3 cp "s3://$ARTIFACT_BUCKET/$PRISMA_ARTIFACT_KEY" "${ARTIFACT_FILE}"

echo 'Unzipping Prisma artifact'
unzip -q "${ARTIFACT_FILE}"

DB_PORT=5432
export DATABASE_URL=postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres

echo 'Running prisma migrate deploy'
"${ROOT_DIR}/node_modules/.bin/prisma" migrate deploy
