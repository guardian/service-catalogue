import type { view_repo_ownership } from 'common/prisma-client/client.js';
import type { Octokit } from 'node_modules/octokit/dist-types/octokit.js';
import type { Config } from '../../config.js';
import type {
	Committer,
	EvaluationResult,
	UnmaintainedRepoOwners,
} from '../../types.js';
import { findContactableOwners } from '../shared-utilities.js';

async function tryToFindMostRecentCommitters(
	config: Config,
	fullName: string,
	octokit: Octokit,
): Promise<string[]> {
	const committers = await (async () => {
		try {
			const commitsResponse = await octokit.rest.repos.listCommits({
				owner: config.gitHubOrg,
				repo: fullName.split('/')[1] ?? '',
				per_page: 15,
				page: 0,
			});

			const committers: Committer[] = commitsResponse.data
				.map((commit) => ({
					name: commit.commit.author?.name,
					username: commit.author?.login,
					email: commit.commit.author?.email,
				}))
				.filter(
					(committer) => !!committer.email && !!committer.username,
				) as Committer[];

			const guardianCommitters = committers.filter(
				(committer) =>
					committer.email.endsWith('@guardian.co.uk') ||
					committer.email.endsWith('@theguardian.com'),
			);

			// Deduplicate committers by email
			const uniqueCommitters = guardianCommitters.reduce<
				Record<string, Committer>
			>((acc, committer) => {
				acc[committer.email] = committer;
				return acc;
			}, {});

			return Object.values(uniqueCommitters);
		} catch (error) {
			console.log(`Failed to fetch committers for ${fullName}:`, error);
			return [];
		}
	})();

	console.log(
		`Unmaintained repo: ${fullName}, recent guardian-addressed committers: `,
		committers,
	);

	return committers.map((c) => c.email);
}

async function findUnmaintainedRepoOwners(
	fullName: string,
	repoOwners: view_repo_ownership[],
	config: Config,
	octokit: Octokit,
): Promise<UnmaintainedRepoOwners> {
	const owners = findContactableOwners(fullName, repoOwners);
	console.log(`Owners for ${fullName}:`, owners);

	if (owners.length === 0) {
		return {
			repo: fullName,
			owners: await tryToFindMostRecentCommitters(config, fullName, octokit),
			format: 'Email',
		};
	}
	return Promise.resolve({
		repo: fullName,
		owners: owners,
		format: 'Team',
	});
}

export async function findOwnersForAllUnmaintainedRepos(
	evaluationResults: EvaluationResult[],
	repoOwners: view_repo_ownership[],
	config: Config,
	octokit: Octokit,
) {
	const unmaintainedRepos = evaluationResults
		.filter((r) => r.repocopRules.archiving === false)
		.map((r) => r.repocopRules.full_name);

	console.log(`Found ${unmaintainedRepos.length} unmaintained repos.`);
	const result = (
		await Promise.all(
			unmaintainedRepos.map((fullName) =>
				findUnmaintainedRepoOwners(fullName, repoOwners, config, octokit),
			),
		)
	).filter((o) => o.owners.length > 0);
	return result;
}
