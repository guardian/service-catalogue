#!/bin/bash
# CI will build a new image with the code here, but you need to update the image
# in packages/cdk/lib/cloudquery/image.ts and redeploy for an changes in this file to take effect
#
# image.ts code snippet:
# * To use a new image, update the SHA here. The full set of possible tags
#	* can be found at
#	* 	https://github.com/guardian/service-catalogue/pkgs/container/service-catalogue%2Fprisma-migrate
#	*/
#	prismaMigrate: ContainerImage.fromRegistry(
#		'ghcr.io/guardian/service-catalogue/prisma-migrate:stable',
#	),

set -e

echo 'Run run-prisma-migrate.sh'

echo 'Step1: Retrieving Prisma artifact from S3'
aws s3 cp "s3://$ARTIFACT_BUCKET/$PRISMA_ARTIFACT_KEY" ./prisma/

echo 'Step2: Unzipping Prisma artifact'
unzip -q prisma/prisma.zip

DB_PORT=5432
export DATABASE_URL=postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres

echo 'Step3: Running prisma migrate deploy'
prisma/node_modules/.bin/prisma migrate deploy