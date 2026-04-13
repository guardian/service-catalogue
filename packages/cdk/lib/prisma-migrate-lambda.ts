import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';

export function createPrismaMigrateLambda(
	scope: GuStack,
	db: DatabaseInstance,
) {
	const fn = new GuLambdaFunction(scope, 'prisma-migrate', {
		app: 'prisma-migrate',
		architecture: Architecture.ARM_64,
		runtime: Runtime.NODEJS_20_X,
		fileName: 'prisma.zip',
		handler: 'dist/src/prisma-migrate.main',
		environment: {
			DATABASE_URL: db.secret!.secretValueFromJson('url').toString(),
		},
	});

	db.secret?.grantRead(fn);

	return fn;
}
