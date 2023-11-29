import type { RunTaskCommandOutput } from '@aws-sdk/client-ecs';
import {
	ECSClient,
	ListClustersCommand,
	ListTagsForResourceCommand,
	ListTaskDefinitionsCommand,
	RunTaskCommand,
} from '@aws-sdk/client-ecs';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { awsClientConfig } from 'common/aws';

interface EcsResourceTags {
	arn: string;
	[key: string]: string;
}

export const getSsmClient = () => {
	return new SSMClient(awsClientConfig('DEV'));
};

const getSsmParameter = async (client: SSMClient, path: string) => {
	const command = new GetParameterCommand({ Name: path });
	const response = await client.send(command);

	if (response.Parameter?.Value === undefined) {
		throw new Error(`SSM Parameter ${path} not found, or has no value`);
	}

	return response.Parameter.Value;
};

export const getPrivateSubnets = async (
	client: SSMClient,
): Promise<string[]> => {
	const value = await getSsmParameter(
		client,
		'/account/vpc/primary/subnets/private',
	);
	return value.split(',');
};

export const getSecurityGroup = async (
	client: SSMClient,
	stack: string,
	stage: string,
	app: string,
): Promise<string> => {
	return await getSsmParameter(
		client,

		// This SSM Parameter has been created in the Service Catalogue stack
		`/${stage}/${stack}/${app}/postgres-access-security-group`,
	);
};

export const getRiffRaffDBSecurityGroup = async (
	client: SSMClient,
	stage: string,
): Promise<string> => {
	return await getSsmParameter(
		client,
		// This SSM Parameter has been created in the Riff Raff DB stack
		`/${stage}/deploy/riff-raff/external-database-access-security-group`,
	);
};

export const getEcsClient = () => {
	return new ECSClient(awsClientConfig('DEV'));
};

const listResourceTags = async (
	client: ECSClient,
	resourceArn: string,
): Promise<Record<string, string>> => {
	const response = await client.send(
		new ListTagsForResourceCommand({ resourceArn }),
	);

	const tags = response.tags ?? [];

	/*
	Flatten the tags.

	From:
	[{key: 'Stack', value: 'deploy' }, { key: 'Stage', value: 'CODE' }]

	To:
	{Stack: 'deploy', Stage: 'CODE'}
	 */
	return tags.reduce<Record<string, string>>((acc, { key, value }) => {
		// This should never happen, but AWS types these as optional, so we need to check
		if (!(key && value)) {
			return acc;
		}

		return {
			...acc,
			[key]: value,
		};
	}, {});
};

const listAllTasks: (client: ECSClient) => Promise<EcsResourceTags[]> = async (
	client: ECSClient,
) => {
	const response = await client.send(new ListTaskDefinitionsCommand({}));
	const taskDefinitionArns = response.taskDefinitionArns ?? [];

	return Promise.all(
		taskDefinitionArns.map<Promise<EcsResourceTags>>(async (taskArn) => {
			return {
				arn: taskArn,
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
): Promise<EcsResourceTags[]> => {
	const tasks = await listAllTasks(client);
	return tasks.filter((taskDescription) => {
		return (
			taskDescription['Stack'] === stack &&
			taskDescription['Stage'] === stage &&
			taskDescription['App'] === app
		);
	});
};

const listClusters = async (client: ECSClient) => {
	const response = await client.send(new ListClustersCommand({}));
	const clusterArns = response.clusterArns ?? [];

	return Promise.all(
		clusterArns.map<Promise<EcsResourceTags>>(async (clusterArn) => {
			return {
				arn: clusterArn,
				...(await listResourceTags(client, clusterArn)),
			};
		}),
	);
};

const findCluster = async (
	client: ECSClient,
	stack: string,
	stage: string,
	app: string,
) => {
	const clusters = await listClusters(client);
	return clusters.find((clusterDescription) => {
		return (
			clusterDescription['Stack'] === stack &&
			clusterDescription['Stage'] === stage &&
			clusterDescription['App'] === app
		);
	});
};

const runTaskByArn = async (
	ecsClient: ECSClient,
	taskArn: string,
	clusterArn: string,
	privateSubnets: string[],
	securityGroups: string[],
): Promise<RunTaskCommandOutput> => {
	const command = new RunTaskCommand({
		cluster: clusterArn,
		taskDefinition: taskArn,
		networkConfiguration: {
			awsvpcConfiguration: {
				subnets: privateSubnets,
				securityGroups: securityGroups,
			},
		},
		capacityProviderStrategy: [{ capacityProvider: 'FARGATE' }],
	});

	return ecsClient.send(command);
};

export const runOneTask = async (
	ecsClient: ECSClient,
	ssmClient: SSMClient,
	stack: string,
	stage: string,
	app: string,
	name: string,
): Promise<URL[]> => {
	const tasks = (await listTasks(ecsClient, stack, stage, app)).filter(
		(taskDescription) => taskDescription['Name'] === name,
	);

	// We expect to find exactly one task matching the name
	if (tasks.length !== 1) {
		throw new Error(
			`${tasks.length} task(s) found matching Stack=${stack} Stage=${stage} App=${app} Name=${name}`,
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we've checked the length above
	const task = tasks.at(0)!;

	const cluster = await findCluster(ecsClient, stack, stage, app);

	if (cluster === undefined) {
		throw new Error(
			`Could not find cluster for Stack=${stack} Stage=${stage} App=${app}`,
		);
	}

	const privateSubnets = await getPrivateSubnets(ssmClient);
	const securityGroup = await getSecurityGroup(ssmClient, stack, stage, app);

	const securityGroups = [
		securityGroup,
		...(task.arn.includes('RiffRaffData')
			? [await getRiffRaffDBSecurityGroup(ssmClient, stage)]
			: []),
	];

	const response = await runTaskByArn(
		ecsClient,
		task.arn,
		cluster.arn,
		privateSubnets,
		securityGroups,
	);

	const taskArns: string[] = response.tasks
		?.map((t) => t.taskArn)
		.filter(Boolean) as string[];

	return taskArns.map((taskArn) => getLogsUrl(app, stage, taskArn));
};

export const runAllTasks = async (
	ecsClient: ECSClient,
	ssmClient: SSMClient,
	stack: string,
	stage: string,
	app: string,
): Promise<URL[]> => {
	const tasks = await listTasks(ecsClient, stack, stage, app);

	if (tasks.length === 0) {
		throw new Error(
			`No task found matching Stack=${stack} Stage=${stage} App=${app}`,
		);
	}

	const cluster = await findCluster(ecsClient, stack, stage, app);

	if (cluster === undefined) {
		throw new Error(
			`Could not find cluster for Stack=${stack} Stage=${stage} App=${app}`,
		);
	}

	const privateSubnets = await getPrivateSubnets(ssmClient);
	const securityGroup = await getSecurityGroup(ssmClient, stack, stage, app);
	const riffRaffDBSecurityGroup = await getRiffRaffDBSecurityGroup(
		ssmClient,
		stage,
	);

	const result = await Promise.all(
		tasks.map((task) =>
			runTaskByArn(ecsClient, task.arn, cluster.arn, privateSubnets, [
				securityGroup,
				...(task.arn.includes('RiffRaffData') ? [riffRaffDBSecurityGroup] : []),
			]),
		),
	);

	const taskArns = result
		.flatMap((r) => r.tasks?.map((t) => t.taskArn))
		.filter(Boolean) as string[];

	return taskArns.map((taskArn) => getLogsUrl(app, stage, taskArn));
};

function getLogsUrl(app: string, stage: string, taskDefinition: string): URL {
	return new URL(
		`https://logs.gutools.co.uk/s/devx/app/discover#/?_a=(columns:!(table,resources,errors,client,message,error))&_g=(filters:!((query:(match_phrase:(app:${app}))),(query:(match_phrase:(stage:${stage}))),(query:(match_phrase:(ecs_task_arn:'${taskDefinition}')))))`,
	);
}
