import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import type { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import {
	DefinitionBody,
	Map,
	Parallel,
	StateMachine,
} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';

type Props = {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: SecurityGroup;
};

export class Obligatron {
	constructor(stack: GuStack, props: Props) {
		const { vpc, db, dbAccess } = props;
		const app = 'obligatron';

		const findAllTeams = new GuLambdaFunction(
			stack,
			'ObligatronLambdaFindAllTeams',
			{
				securityGroups: [dbAccess],
				vpc,
				app: `${app}-find-all-teams`,
				fileName: `${app}.zip`,
				handler: 'FindAllTeams/index.handler',
				runtime: Runtime.NODEJS_20_X,
				architecture: Architecture.ARM_64,
				environment: {
					DATABASE_HOSTNAME: db.dbInstanceEndpointAddress,
					QUERY_LOGGING: 'false', // Set this to 'true' to enable SQL query logging,
				},
			},
		);

		db.grantConnect(findAllTeams, 'obligatron');

		const obligationLambas = [
			new GuLambdaFunction(stack, `ObligatronLambdaTagging`, {
				vpc,
				app: `${app}-obligation-tagging`,
				fileName: `${app}.zip`,
				handler: `ObligationTagging/index.handler`,
				runtime: Runtime.NODEJS_20_X,
				architecture: Architecture.ARM_64,
			}),
			new GuLambdaFunction(stack, `ObligatronLambdaFSBP`, {
				vpc,
				app: `${app}-obligation-fsbp`,
				fileName: `${app}.zip`,
				handler: `ObligationFSBP/index.handler`,
				runtime: Runtime.NODEJS_20_X,
				architecture: Architecture.ARM_64,
			}),
		];

		const saveObligationResults = new GuLambdaFunction(
			stack,
			'ObligatronLambdaSaveObligationResults',
			{
				vpc,
				app: `${app}-save-obligation-results`,
				fileName: `${app}.zip`,
				handler: 'SaveObligationResults/index.handler',
				runtime: Runtime.NODEJS_20_X,
				architecture: Architecture.ARM_64,
			},
		);

		const definition = new LambdaInvoke(stack, 'FindAllTeams', {
			lambdaFunction: findAllTeams,
			payloadResponseOnly: true,
		})
			.next(
				new Map(stack, 'ForEachTeam').itemProcessor(
					new Parallel(stack, 'DoObligationsInParallel').branch(
						...obligationLambas.map(
							(lambda) =>
								new LambdaInvoke(stack, `Check${lambda.functionName}`, {
									lambdaFunction: lambda,
									payloadResponseOnly: true,
								}),
						),
					),
				),
			)
			.next(
				new LambdaInvoke(stack, 'SaveObligationResults', {
					lambdaFunction: saveObligationResults,
				}),
			);

		new StateMachine(stack, 'ObligatronStateMachine', {
			definitionBody: DefinitionBody.fromChainable(definition),
		});
	}
}
