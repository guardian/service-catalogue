import { Anghammarad } from '@guardian/anghammarad';
import type { repocop_github_repository_rules } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getConfig } from './config';
import {
	notifyAnghammaradBranchProtection,
	notifyBranchProtector,
} from './remediations/repository-02-branch_protection';
import { evaluateRepositories } from './rules/repository';

async function writeEvaluationTable(
	evaluatedRepos: repocop_github_repository_rules[],
	prisma: PrismaClient,
) {
	console.log('Clearing the table');
	await prisma.repocop_github_repository_rules.deleteMany({});

	console.log(`Writing ${evaluatedRepos.length} records to table`);
	await prisma.repocop_github_repository_rules.createMany({
		data: evaluatedRepos,
	});

	console.log('Finished writing to table');
}

export async function main() {
	const config = await getConfig();
	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: config.databaseConnectionString,
			},
		},
		...(config.withQueryLogging && {
			log: [
				{
					emit: 'stdout',
					level: 'query',
				},
			],
		}),
	});

	const evaluatedRepos: repocop_github_repository_rules[] =
		await evaluateRepositories(prisma, config.ignoredRepositoryPrefixes);

	await writeEvaluationTable(evaluatedRepos, prisma);
	if (config.enableMessaging) {
		const msgs = await notifyBranchProtector(prisma, evaluatedRepos, config);
		if (config.stage === 'PROD') {
			const anghammaradClient = new Anghammarad();
			await notifyAnghammaradBranchProtection(msgs, config, anghammaradClient);
		}
	} else {
		console.log(
			'Messaging is not enabled. Set ENABLE_MESSAGING flag to enable.',
		);
	}

	console.log('Done');
}
