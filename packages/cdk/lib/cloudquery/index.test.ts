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

type TaskDefinitionResource = {
	Type: 'AWS::ECS::TaskDefinition';
	Properties: {
		Tags: [{ Key: string; Value: string }];
	};
};

const template = Template.fromStack(stack);

// We had a problem with the Cloudquery task definition exceeding the ECS limit of 65536 bytes
const limitForTaskDefinition = 62200;
it(`task definition is under the limit ${limitForTaskDefinition}`, () => {
	Object.values(template.findResources('AWS::ECS::TaskDefinition')).map(
		(taskDefinition) => {
			const typedTaskDefinition = taskDefinition as TaskDefinitionResource;
			const taskDefLength = JSON.stringify(taskDefinition).length;
			if (taskDefLength > limitForTaskDefinition) {
				console.log(
					typedTaskDefinition.Properties.Tags.find((tag) => tag.Key === 'Name')
						?.Value,
					JSON.stringify(taskDefinition, null, 2).length,
				);
			}
			expect(taskDefLength).toBeLessThan(limitForTaskDefinition);
		},
	);
});
