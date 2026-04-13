import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Duration } from 'aws-cdk-lib';
import type { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';

interface PrismaMigrateLambdaProps {
	db: DatabaseInstance;
	vpc: IVpc;
	dbAccess: ISecurityGroup;
}

export function createPrismaMigrateLambda(
	scope: GuStack,
	{ db, vpc, dbAccess }: PrismaMigrateLambdaProps,
) {
	if (!db.secret) {
		throw new Error('DB Secret is missing');
	}

	const fn = new GuLambdaFunction(scope, 'prisma-migrate', {
		app: 'prisma-migrate',
		architecture: Architecture.ARM_64,
		runtime: Runtime.NODEJS_20_X,
		fileName: 'prisma-lambda.zip',
		handler: 'dist/src/prisma-migrate.main',
		vpc,
		securityGroups: [dbAccess],
		environment: {
			DB_SECRET_ARN: db.secret.secretArn,
			NODE_EXTRA_CA_CERTS: '/var/runtime/ca-cert.pem',
		},
		timeout: Duration.minutes(5),
	});

	db.secret.grantRead(fn);

	return fn;
}
