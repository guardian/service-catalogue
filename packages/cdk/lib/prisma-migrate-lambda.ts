import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';

export function createPrismaMigrateLambda(scope: GuStack) {
	return new GuLambdaFunction(scope, 'prisma-migrate', {
		app: 'prisma-migrate',
		architecture: Architecture.ARM_64,
		runtime: Runtime.NODEJS_20_X,
		fileName: 'prisma.zip',
		handler: 'src/prisma-migrate.main',
	});
}
