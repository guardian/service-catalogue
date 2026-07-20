import { homedir } from 'node:os';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { getEnvOrThrow } from 'common/functions.js';
import { awsClientConfig } from 'common/src/aws.js';
import { getCentralElkLink } from 'common/src/logs.js';
import type { DependencyGraphIntegratorEvent } from 'common/types.js';

loadEnvFile(`${homedir()}/.gu/service_catalogue/.env.local`);

/**
 * checks if the current module is the entry point script - replaces the CommonJs `require.main === module` check
 * `import.meta.url` represents the URL of the current module file, e.g. run-locally.ts
 * `process.argv[1]` represents the path to the script that was executed - it's the second
argument in the process's argument vector (the first being the Node executable).
*/
const isMain = fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
	const snsClient = new SNSClient(awsClientConfig('DEV'));

	const message: DependencyGraphIntegratorEvent = {
		name: 'service-catalogue',
		language: 'Scala',
		admins: ['devx-security'],
	};

	const publish = new PublishCommand({
		Message: JSON.stringify(message),
		TopicArn: getEnvOrThrow('DEPENDENCY_GRAPH_INPUT_TOPIC_ARN'),
	});

	await snsClient.send(publish);

	console.log(
		"Test event sent to CODE dependency-graph-integrator's input topic.",
	);
	const logLink = getCentralElkLink({
		filters: {
			stage: 'CODE',
			app: 'dependency-graph-integrator',
		},
	});
	console.log(`View the logs at ${logLink}`);
}
