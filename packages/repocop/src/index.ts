import { PrismaClient } from '@prisma/client';
import { getConfig } from './config';
import { repositoryRuleEvaluation } from './rules/repository';

export async function main() {
	const config = await getConfig();
	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: config.databaseConnectionString,
			},
		},
	});

	// TODO Process ALL repositories
	const repo = await prisma.github_repositories.findFirst();

	if (!repo) {
		console.log('No repositories found');
	} else {
		const branches = await prisma.github_repository_branches.findMany();
		const ruleEvaluation = repositoryRuleEvaluation(repo, branches);

		console.log('The results are in...');
		console.log(JSON.stringify(ruleEvaluation, null, 2));

		console.log('Clearing the table');
		await prisma.repocop_github_repository_rules.deleteMany({});

		console.log('Writing to table');
		await prisma.repocop_github_repository_rules.createMany({
			data: [ruleEvaluation],
		});
	}

	console.log('Done');
}
