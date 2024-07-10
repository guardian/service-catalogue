import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { createDigestsFromFindings } from './digests';
import { getFsbpFindings } from './findings';
import type { SecurityHubSeverity } from './types';

export async function main(
	input: { severities: SecurityHubSeverity[] } | null,
) {
	const config = await getConfig();
	const prisma = getPrismaClient(config);
	const anghammarad = new Anghammarad();

	const findings = await getFsbpFindings(
		prisma,
		input ? input.severities : config.severities,
	);
	const digests = createDigestsFromFindings(findings);

	if (config.stage === 'PROD') {
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
						topicArn: config.anghammaradSnsTopic,
					}),
			),
		);
	} else {
		for (const digest of digests) {
			console.log({ digest });
		}
	}
}
