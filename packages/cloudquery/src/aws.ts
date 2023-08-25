import type { RunTaskCommandOutput } from '@aws-sdk/client-ecs';
import {
	ECSClient,
	ListClustersCommand,
	ListTagsForResourceCommand,
	ListTaskDefinitionsCommand,
	RunTaskCommand,
} from '@aws-sdk/client-ecs';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';

interface EcsResourceTags {
	arn: string;
	[key: string]: string;
}

const awsConfig = {
	region: 'eu-west-1',
	credentials: fromIni({ profile: 'deployTools' }),
};

export const getSsmClient = () => {
	return new SSMClient(awsConfig);
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

export const getEcsClient = () => {
	return new ECSClient(awsConfig);
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

export const runTask = async (
	ecsClient: ECSClient,
	ssmClient: SSMClient,
	stack: string,
	stage: string,
	app: string,
	name: string,
): Promise<RunTaskCommandOutput> => {
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

	const command = new RunTaskCommand({
		cluster: cluster.arn,
		taskDefinition: task.arn,
		networkConfiguration: {
			awsvpcConfiguration: {
				subnets: privateSubnets,
				securityGroups: [securityGroup],
			},
		},
		capacityProviderStrategy: [{ capacityProvider: 'FARGATE' }],
	});

	return ecsClient.send(command);
};
