import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { cloudQueryTablesToSync } from 'cloudquery-tables';
import { serviceCataloguePRODProperties } from '../bin/cdk';
import { ScheduledCloudqueryTask } from './cloudquery/task';
import { ServiceCatalogue } from './service-catalogue';

describe('The ServiceCatalogue stack', () => {
	beforeAll(() => {
		/*
		Each CloudQuery task generates a SQL statement to insert its cadence into the `cloudquery_table_frequency` database table.
		This value can change depending on how many days there are in the current month.
    For example, for a task that runs on the first of every month (` Schedule.cron({ day: '1', hour: '0', minute: '0' })`):
		- In May the value will be 2678400000 (31 days)
		- In June the value will be 2592000000 (30 days)
		Mock the current date to ensure the Jest snapshot is stable.
		 */
		const date = new Date('2025-05-01');
		jest.useFakeTimers().setSystemTime(date);
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	const app = new App();
	const stack = new ServiceCatalogue(
		app,
		'ServiceCatalogue',
		serviceCataloguePRODProperties,
	);

	it('matches the snapshot', () => {
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('only uses arm64 lambdas', () => {
		const lambdas = stack.node
			.findAll()
			.filter((child): child is CfnFunction => child instanceof CfnFunction);

		const architectures = new Set(
			lambdas.flatMap((lambda) => lambda.architectures),
		);

		// Only 1 architecture is used...
		expect(architectures.size).toEqual(1);

		// ...and it's arm64
		expect(architectures.has('arm64')).toEqual(true);
	});

	// We had a problem with the Cloudquery task definition exceeding the ECS limit of 65536 bytes
	const limitForTaskDefinition = 65536 * 0.95; // Leave a bit of headroom for safety
	it(`task definition is under the limit ${limitForTaskDefinition}`, () => {
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

	it('collects listed CloudQuery tables', () => {
		const tasks = stack.node
			.findAll()
			.filter(
				(child): child is ScheduledCloudqueryTask =>
					child instanceof ScheduledCloudqueryTask,
			);

		const collected: string[] = tasks.flatMap(
			(_) => _.sourceConfig.spec.tables,
		);

		const notCollected = cloudQueryTablesToSync.filter(
			(_) => !collected.includes(_),
		);

		const collectedUnlisted = collected.filter(
			(_) => !cloudQueryTablesToSync.includes(_),
		);

		if (notCollected.length > 0) {
			console.log(
				'The following tables are allow-listed but not collected by any CloudQuery task:',
			);
			console.log(notCollected.join('\n'));
		}

		if (collectedUnlisted.length > 0) {
			console.log(
				'The following tables are being collected but are not listed in the allow-list:',
			);
			console.log(collectedUnlisted.join('\n'));
		}

		expect(notCollected.length).toEqual(0);
		expect(collectedUnlisted.length).toEqual(0);
	});

	test('A task collects at least one table', () => {
		const tasks = stack.node
			.findAll()
			.filter(
				(child): child is ScheduledCloudqueryTask =>
					child instanceof ScheduledCloudqueryTask,
			);

		const invalidTasks = tasks
			.map((task) => ({
				name: task.name,
				numberOfTablesCollected: task.sourceConfig.spec.tables.length,
			}))
			.filter((_) => _.numberOfTablesCollected === 0);

		const numberOfInvalidTasks = Object.keys(invalidTasks).length;

		if (numberOfInvalidTasks > 0) {
			console.log(`The following tasks are invalid as they collect no tables:`);
			console.log(invalidTasks.map((_) => `- ${_.name}`).join('\n'));
		}

		expect(numberOfInvalidTasks).toEqual(0);
	});
});
