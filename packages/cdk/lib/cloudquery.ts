import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuVpc, SubnetType } from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';

export class CloudQuery extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = props.app ?? 'cloudquery';
		const vpc = GuVpc.fromIdParameter(this, 'vpc');
		const privateSubnets = GuVpc.subnetsFromParameter(this, {
			type: SubnetType.PRIVATE,
			app,
		});

		const dbProps: DatabaseInstanceProps = {
			engine: DatabaseInstanceEngine.POSTGRES,
			vpc,
			vpcSubnets: { subnets: privateSubnets },
			iamAuthentication: true,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
		};

		const db = new DatabaseInstance(this, 'PostgresInstance1', dbProps);

		db.connections.allowDefaultPortInternally();
	}
}
