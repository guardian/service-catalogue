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

	const config = await getConfig();
	const prisma = getPrismaClient(config);
	const snsClient = new SNSClient(awsClientConfig(config.stage));
	const anghammaradClient = new Anghammarad(
		snsClient,
		config.anghammaradSnsTopic,
	);

	await Promise.all([
		createFsbpTableAndAlerts(config, prisma, anghammaradClient),
		sendBreakglassUserAlerts(config, prisma, anghammaradClient),
	]);

	logger.log({ message: 'Cloudbuster run completed.' });
}
