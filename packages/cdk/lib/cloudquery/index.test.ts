import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { ServiceCatalogue } from '../service-catalogue';

const app = new App();
const stack = new ServiceCatalogue(app, 'ServiceCatalogue', {
	stack: 'deploy',
	stage: 'TEST',
	securityAlertSchedule: Schedule.cron({
		weekDay: 'MON-FRI',
		hour: '3',
		minute: '0',
	}),
	enableCloudquerySchedules: true,
	databaseDeletionProtection: true,
	databaseMultiAz: false,
	databaseInstanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
	databaseEbsByteBalanceAlarm: true,
	env: { region: 'eu-west-1' },
});

/*
Whilst incomplete, this type definition of an AWS::ECS::TaskDefinition resource is enough for this test.
See https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-ecs-taskdefinition.html
 */
type TaskDefinitionResource = {
	Type: 'AWS::ECS::TaskDefinition';
	Properties: {
		Tags: [{ Key: string; Value: string }];
	};
};

const template = Template.fromStack(stack);

// We had a problem with the Cloudquery task definition exceeding the ECS limit of 65536 bytes
const limitForTaskDefinition = 65536 * 0.95; // Leave a bit of headroom for safety
//const limitForTaskDefinition = 40000; // Leave a bit of headroom for safety
it(`task definition is under the limit ${limitForTaskDefinition}`, () => {
	Object.values(template.findResources('AWS::ECS::TaskDefinition')).forEach(
		(resource) => {
			const taskDefinition = resource as TaskDefinitionResource;
			const taskDefinitionLength = JSON.stringify(resource).length;
			const taskName = taskDefinition.Properties.Tags.find(
				({ Key }) => Key === 'Name',
			)?.Value;
			if (taskDefinitionLength > limitForTaskDefinition) {
				throw new Error(
					`AWS::ECS::TaskDefinition named ${taskName} exceeds the allowed length (actual: ${taskDefinitionLength}, max: ${limitForTaskDefinition}).`,
				);
			}
			expect(taskDefinitionLength).toBeLessThan(limitForTaskDefinition);
		},
	);
});
