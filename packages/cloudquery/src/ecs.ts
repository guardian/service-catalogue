import {
	ECSClient,
	ListTagsForResourceCommand,
	ListTaskDefinitionsCommand,
} from '@aws-sdk/client-ecs';
import { fromIni } from '@aws-sdk/credential-providers';

interface TaskDescription {
	/**
	 * The task's ARN.
	 */
	taskArn: string;

	/**
	 * The task's tags.
	 */
	[key: string]: string;
}

export const getClient = () => {
	return new ECSClient({
		region: 'eu-west-1',
		credentials: fromIni({ profile: 'deployTools' }),
	});
};

const listResourceTags = async (
	client: ECSClient,
	resourceArn: string,
): Promise<Record<string, string>> => {
	const response = await client.send(
		new ListTagsForResourceCommand({ resourceArn }),
	);

	const tags = response.tags ?? [];

	return tags.reduce<Record<string, string>>((acc, { key, value }) => {
		if (!(key && value)) {
			return acc;
		}

		return {
			...acc,
			[key]: value,
		};
	}, {});
};

const listAllTasks = async (client: ECSClient) => {
	const response = await client.send(new ListTaskDefinitionsCommand({}));
	const taskDefinitionArns = response.taskDefinitionArns ?? [];

	return Promise.all(
		taskDefinitionArns.map<Promise<TaskDescription>>(async (taskArn) => {
			return {
				taskArn: taskArn,
				...(await listResourceTags(client, taskArn)),
			};
		}),
	);
};

export const listTasks = async (
	client: ECSClient,
	stack: string,
	stage: string,
	app: string,
) => {
	const tasks = await listAllTasks(client);
	return tasks.filter((taskDescription) => {
		return (
			taskDescription['Stack'] === stack &&
			taskDescription['Stage'] === stage &&
			taskDescription['App'] === app
		);
	});
};
