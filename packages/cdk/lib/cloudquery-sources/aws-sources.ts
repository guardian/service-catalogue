import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuardianAwsAccounts } from '@guardian/private-infrastructure-config';
import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import type { CloudquerySource } from '../ecs/cluster';
import {
	awsSourceConfigForAccount,
	awsSourceConfigForOrganisation,
	skipTables,
} from '../ecs/config';
import { cloudqueryAccess, listOrgsPolicy } from '../ecs/policies';

export class AwsSources {
	public readonly individualSources: CloudquerySource[];
	public readonly remainingSource: CloudquerySource;
	constructor(
		guStack: GuStack,
		app: string,
		nonProdSchedule: Schedule | undefined,
	) {
		const individualAwsSources: CloudquerySource[] = [
			{
				name: 'DeployToolsListOrgs',
				description:
					'Data about the AWS Organisation, including accounts and OUs. Uses include mapping account IDs to account names.',

				schedule:
					nonProdSchedule ??
					Schedule.cron({ month: '1', day: '1', hour: '10' }), // Run on the first of the month at 10am
				config: awsSourceConfigForAccount(GuardianAwsAccounts.DeployTools, {
					tables: [
						/*
                        Collect all AWS Organisation tables, including account names, and which OU they belong to.
                        A wildcard is used, as there are a lot of tables!
                        See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#use-wildcard-matching
                         */
						'aws_organization*',
					],
				}),
				policies: [
					listOrgsPolicy,
					cloudqueryAccess(GuardianAwsAccounts.DeployTools),
				],
			},
			{
				name: 'DelegatedToSecurityAccount',
				description:
					'Organisation wide security data, from access analyzer and security hub. Uses include identifying lambdas using deprecated runtimes.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '22' }),
				config: awsSourceConfigForAccount(GuardianAwsAccounts.Security, {
					tables: ['aws_accessanalyzer_*', 'aws_securityhub_*'],
					concurrency: 2000,
				}),
				policies: [cloudqueryAccess(GuardianAwsAccounts.Security)],
				memoryLimitMiB: 2048,
				cpu: 1024,
			},
			{
				name: 'OrgWideCloudFormation',
				description:
					'Collecting CloudFormation data across the organisation. We use CloudFormation stacks as a proxy for a service, so collect the data multiple times a day',
				schedule: nonProdSchedule ?? Schedule.rate(Duration.hours(3)),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_cloudformation_*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideLoadBalancers',
				description:
					'Collecting load balancer data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '23' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_elbv1_*', 'aws_elbv2_*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideAutoScalingGroups',
				description:
					'Collecting ASG data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '0' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_autoscaling_groups'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideCertificates',
				description:
					'Collecting certificate data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '1' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_acm*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideCloudwatchAlarms',
				description:
					'Collecting CloudWatch Alarm data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '2' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_cloudwatch_alarms'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideInspector',
				description: 'Collecting Inspector data across the organisation.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '3' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_inspector_findings', 'aws_inspector2_findings'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideS3',
				description:
					'Collecting S3 data across the organisation. Uses include identifying which account a bucket resides.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '4' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_s3*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideDynamoDB',
				description:
					'Collecting DynamoDB data across the organisation. Uses include auditing backup configuration.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '5' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_dynamodb*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideEc2',
				description:
					'Collecting EC2 instance information, and their security groups. Uses include identifying instances failing the "30 day old" SLO, and (eventually) replacing Prism.',
				schedule: nonProdSchedule ?? Schedule.rate(Duration.minutes(30)),
				config: awsSourceConfigForOrganisation({
					tables: [
						'aws_ec2_instances',
						'aws_ec2_security_groups',
						'aws_ec2_images',
					],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
		];

		/*
		This is a catch-all task, collecting all other AWS data.
		Although we're not using the data for any particular reason, it is still useful to have.

		It runs once a week because there is a lot of data, and we need to avoid overlapping invocations.
		If we identify a table that needs to be updated more often, we should create a dedicated task for it.
		 */

		// Tables we are skipping because they are slow and or uninteresting to us.

		const remainingAwsSources: CloudquerySource = {
			name: 'RemainingAwsData',
			description: 'Data fetched across all accounts in the organisation.',
			schedule:
				nonProdSchedule ??
				Schedule.cron({ minute: '0', hour: '16', weekDay: 'SAT' }), // Every Saturday, at 4PM UTC
			config: awsSourceConfigForOrganisation({
				tables: ['aws_*'],
				skipTables: [
					...skipTables,

					// casting because `config.spec.tables` could be empty, though in reality it never is
					...(individualAwsSources.flatMap(
						(_) => _.config.spec.tables,
					) as string[]),
				],

				// Defaulted to 500000 by ServiceCatalogue, concurrency controls the maximum number of Go routines to use.
				// The amount of memory used is a function of this value.
				// See https://www.cloudquery.io/docs/reference/source-spec#concurrency.
				concurrency: 2000,
			}),
			policies: [cloudqueryAccess('*')],

			// This task is quite expensive, and requires more power than the default (500MB memory, 0.25 vCPU).
			memoryLimitMiB: 2048,
			cpu: 1024,
		};

		this.individualSources = individualAwsSources;
		this.remainingSource = remainingAwsSources;
	}
}
