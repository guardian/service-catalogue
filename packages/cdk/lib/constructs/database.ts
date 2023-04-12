import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import { GuAppAwareConstruct } from '@guardian/cdk/lib/utils/mixin/app-aware-construct';
import { RemovalPolicy } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Port } from 'aws-cdk-lib/aws-ec2';
import type { CfnDBInstance, DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import type { IInstanceEngine } from 'aws-cdk-lib/aws-rds/lib/instance-engine';
import {
	ParameterDataType,
	ParameterTier,
	StringParameter,
} from 'aws-cdk-lib/aws-ssm';

interface GuDatabaseProps
	extends AppIdentity,
		Omit<
			DatabaseInstanceProps,
			// The following are required props on `DatabaseInstanceProps`.
			// Make them optional, with sensible defaults.
			// They're still settable though.
			| 'engine' // Defaults to Postgres.
			| 'vpc' // `vpc` is a required property in `DatabaseInstanceProps`. It's optional here, and defaults to the primary VPC.

			// The following are optional props on `DatabaseInstanceProps`.
			// Remove them to offer better defaults.
			| 'storageEncrypted' // Always encrypted.
			| 'securityGroups' // We create our own explicit security group, and optionally wire it into an SSM Parameter.
		> {
	/**
	 * The database engine;
	 *
	 * @default DatabaseInstanceEngine.POSTGRES
	 */
	engine?: IInstanceEngine;

	/**
	 * The VPC network where the DB subnet group should be created.
	 *
	 * @default The account's Primary VPC
	 */
	vpc?: IVpc;

	/**
	 * The identifier of the CA certificate for this DB instance.
	 * Ensure to add the certificate to the environment's trust store.
	 *
	 * @default rds-ca-rsa2048-g1
	 *
	 * @see https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.RegionCertificateAuthorities
	 * @see https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.CertificatesAllRegions
	 */
	caCertificateIdentifier?:
		| 'rds-ca-2019'
		| 'rds-ca-rsa2048-g1'
		| 'rds-ca-rsa4096-g1'
		| 'rds-ca-ecc384-g1';

	/**
	 * Create SSM Parameters holding the security group, and endpoint address for easy use by downstream systems.
	 *
	 * The SSM Parameters created are:
	 *  - /STAGE/STACK/APP/database/access-security-group
	 *  - /STAGE/STACK/APP/database/endpoint-address
	 *
	 * @default false
	 */
	allowExternalConnection?: boolean;
}

/**
 * A Postgres database instance with the following defaults:
 *  - Storage encryption
 *  - Placement in the Primary VPC, and in the private subnets
 *  - A Certificate Authority of rds-ca-rsa2048-g1, which supports auto-rotation
 *
 * TODO:
 *  - Move to the GuCDK library (https://github.com/guardian/cdk/issues/1786)
 *  - Contribute grantConnect patch upstream to AWS CDK (https://github.com/aws/aws-cdk/issues/11851)
 */
export class GuDatabase extends GuAppAwareConstruct(DatabaseInstance) {
	/**
	 * The AWS Region-unique, immutable identifier for the DB instance.
	 * This identifier is found in AWS CloudTrail log entries whenever the AWS KMS key for the DB instance is accessed.
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbinstance.html#aws-resource-rds-dbinstance-return-values
	 */
	public readonly instanceResourceId: string;

	/**
	 * The security group that applications should use to gain access to the database.
	 */
	public readonly accessSecurityGroup: GuSecurityGroup;

	private get cfnResource(): CfnDBInstance {
		return this.node.defaultChild as CfnDBInstance;
	}

	constructor(scope: GuStack, id: string, props: GuDatabaseProps) {
		const {
			app,
			allowExternalConnection = false,
			caCertificateIdentifier = 'rds-ca-rsa2048-g1',
			vpc = GuVpc.fromIdParameter(scope, 'primary-vpc'),
			vpcSubnets = {
				subnets: GuVpc.subnetsFromParameter(scope, {
					type: SubnetType.PRIVATE,
					app,
				}),
			},
			port = 5432,
			engine = DatabaseInstanceEngine.POSTGRES,
		} = props;

		const defaultSecurityGroup = new GuSecurityGroup(
			scope,
			'DefaultSecurityGroup',
			{
				vpc,
				app,
			},
		);

		const defaults: DatabaseInstanceProps = {
			vpc,
			vpcSubnets,
			engine,
			port,
			storageEncrypted: true,
			deletionProtection: true,
			removalPolicy: RemovalPolicy.SNAPSHOT,
			publiclyAccessible: false,
			iamAuthentication: true,
			multiAz: true,
			securityGroups: [defaultSecurityGroup],
		};

		super(scope, id, { ...defaults, ...props });

		this.instanceResourceId = this.cfnResource.attrDbiResourceId;
		this.accessSecurityGroup = defaultSecurityGroup;

		this.cfnResource.caCertificateIdentifier = caCertificateIdentifier;

		this.connections.allowFrom(defaultSecurityGroup, Port.tcp(port));

		if (allowExternalConnection) {
			const { stack, stage } = scope;

			new StringParameter(this, 'AccessSecurityGroupParam', {
				parameterName: `/${stage}/${stack}/${app}/database/access-security-group`,
				simpleName: false,
				stringValue: defaultSecurityGroup.securityGroupId,
				tier: ParameterTier.STANDARD,
				dataType: ParameterDataType.TEXT,
			});
			new StringParameter(this, 'EndpointAddressParam', {
				parameterName: `/${stage}/${stack}/${app}/database/endpoint-address`,
				simpleName: false,
				stringValue: this.dbInstanceEndpointAddress,
				tier: ParameterTier.STANDARD,
				dataType: ParameterDataType.TEXT,
			});
		}
	}
}
