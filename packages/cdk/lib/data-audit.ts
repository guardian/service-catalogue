import { GuScheduledLambda } from '@guardian/cdk';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration, Tags } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { cloudqueryAccess, listOrgsPolicy } from './cloudquery/policies';

interface DataAuditProps {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
}

export function addDataAuditLambda(scope: GuStack, props: DataAuditProps) {
	const app = 'data-audit';

	const { vpc, dbAccess, db } = props;
	const { stage } = scope;

	const role = new Role(scope, 'DataAuditRole', {
		assumedBy: new ServicePrincipal('lambda.amazonaws.com'),

		/*
		The lambda will be assuming the `cloudquery-access` role.
		This role's principal has been narrowed to a pattern.

		See https://github.com/guardian/aws-account-setup/pull/166.
		 */
		roleName: `service-catalogue-${app}-${stage}`,

		/*
		These managed policies do not meet AWS FSBP.
		TODO remove these once GuCDK has improved - https://github.com/guardian/cdk/pull/2212.

		See:
		  - https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html
		  - https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSLambdaBasicExecutionRole.html
		  - https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSLambdaVPCAccessExecutionRole.html
		 */
		managedPolicies: [
			ManagedPolicy.fromManagedPolicyArn(
				scope,
				'AWSLambdaBasicExecutionRole',
				'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
			),
			ManagedPolicy.fromManagedPolicyArn(
				scope,
				'AWSLambdaVPCAccessExecutionRole',
				'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
			),
		],
	});

	Tags.of(role).add('App', app);

	const lambda = new GuScheduledLambda(scope, 'DataAudit', {
		role,
		app,
		vpc,
		securityGroups: [dbAccess],
		fileName: `${app}.zip`,
		handler: 'index.main',
		environment: {
			DATABASE_HOSTNAME: db.dbInstanceEndpointAddress,
			QUERY_LOGGING: 'false', // Set this to 'true' to enable SQL query logging,
		},
		monitoringConfiguration: { noMonitoring: true },
		rules: [
			{
				schedule: Schedule.rate(Duration.days(1)),
			},
		],
		runtime: Runtime.NODEJS_20_X,
		timeout: Duration.minutes(10),
	});

	db.grantConnect(lambda, 'dataaudit');
	lambda.addToRolePolicy(listOrgsPolicy);

	// Use the same IAM Role that CloudQuery uses to eliminate permission issues being the cause of data difference
	lambda.addToRolePolicy(cloudqueryAccess('*'));
}
