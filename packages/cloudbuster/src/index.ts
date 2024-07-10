import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { createDigestsFromFindings } from './digests';
import { getFsbpFindings } from './findings';
import type { SecurityHubSeverity } from './types';

export async function main(input: { severities: SecurityHubSeverity[] }) {
	const config = await getConfig();
	const prisma = getPrismaClient(config);
	const anghammarad = new Anghammarad();

	const findings = await getFsbpFindings(prisma, input.severities);
	const digests = createDigestsFromFindings(findings);

	if (config.stage === 'PROD') {
		if (!config.anghammaradSnsTopic) {
			throw new Error(
				'ANGHAMMARAD_SNS_ARN environment variable not found. Cannot send digests.',
			);
		}

		await Promise.all(
			digests.map(
				async (d) =>
					await anghammarad.notify({
						subject: d.subject,
						message: d.message,
						actions: [
							{
								cta: 'abc',
								url: 'test',
							},
						],
						target: { AwsAccount: d.accountId },
						channel: RequestedChannel.PreferHangouts,
						sourceSystem: `cloudbuster ${config.stage}`,
						topicArn: config.anghammaradSnsTopic as string,
					}),
			),
		);
	} else {
		for (const digest of digests) {
			console.log({ digest });
		}
	}
}
