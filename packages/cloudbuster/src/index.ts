import { SNSClient } from '@aws-sdk/client-sns';
import { Anghammarad } from '@guardian/anghammarad';
import { awsClientConfig } from 'common/aws.js';
import { logger } from 'common/logs.js';
import { getPrismaClient } from 'common/src/prisma-client-setup.js';
import { sendBreakglassUserAlerts } from './breakglass/index.js';
import { getConfig } from './config.js';
import { createFsbpTableAndAlerts } from './fsbp/index.js';

export async function main() {
	logger.log({ message: 'Cloudbuster run starting.' });
	const cloudbusterConfig = await getConfig();
	const awsConfig = awsClientConfig(cloudbusterConfig.stage);
	const prisma = getPrismaClient(cloudbusterConfig);
	const snsClient = new SNSClient(awsConfig);
	const anghammaradClient = new Anghammarad(
		snsClient,
		cloudbusterConfig.anghammaradSnsTopic,
	);

	await Promise.all([
		createFsbpTableAndAlerts(cloudbusterConfig, prisma, anghammaradClient),
		sendBreakglassUserAlerts(
			cloudbusterConfig,
			awsConfig,
			prisma,
			anghammaradClient,
		),
	]);

	logger.log({ message: 'Cloudbuster run completed.' });
}
