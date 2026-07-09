/**
 * Assembles the deterministic seed payload used by the local database seed flow.
 *
 * This module expands declarative fixture data into the full set of persisted
 * seed records by coordinating lower-level row builders with scenario-specific
 * seed rules.
 */
import type { Prisma } from 'common/prisma-client/client.js';
import {
	addOptionalSeedData,
	createEmptySeedData,
	createGithubActionsUsage,
	createGithubWorkflow,
	createRepoAndChildren,
	createRepoOwnership,
} from './seed-builders.js';
import {
	defaultWorkflowPath,
	orgName,
	workflowDirectory,
} from './seed-constants.js';
import {
	invalidWorkflowContents,
	invalidWorkflowPath,
	invalidWorkflowRepoId,
	repoDefinitions,
	teamDefinitions,
} from './seed-data.js';
import { createSeedMetadata } from './seed-helpers.js';
import type { GitHubSeedData, TeamSlug } from './seed-types.js';

/**
 * Builds the intentionally invalid workflow row used by local testing scenarios.
 */
function createInvalidGithubWorkflow(
	repositoryId: bigint,
	invalidWorkflowId: bigint,
): Prisma.github_workflowsCreateManyInput {
	return {
		...createSeedMetadata(),
		org: orgName,
		id: invalidWorkflowId,
		repository_id: repositoryId,
		path: `${workflowDirectory}/${invalidWorkflowPath}`,
		contents: invalidWorkflowContents,
	};
}

/**
 * Expands repository fixture definitions into the full persisted seed payload.
 */
export function buildGitHubSeedData(): GitHubSeedData {
	const teamIdsBySlug = new Map<TeamSlug, bigint>(
		teamDefinitions.map(({ id, slug }) => [slug, BigInt(id)] as const),
	);

	return repoDefinitions.reduce<GitHubSeedData>((acc, definition) => {
		const repoBundle = createRepoAndChildren(
			definition.id,
			definition.name,
			definition.languages,
		);
		const repoFullName = `${orgName}/${definition.name}`;

		acc.repos.push(repoBundle.repo);
		acc.languages.push(repoBundle.languages);
		acc.branches.push(...repoBundle.branches);

		const primaryWorkflowId = BigInt(definition.id * 100);

		acc.githubWorkflows.push(
			createGithubWorkflow(
				primaryWorkflowId,
				repoBundle.repositoryId,
				definition.githubActionsUses,
				definition.workflowPath ?? defaultWorkflowPath,
			),
		);

		acc.githubActionsUsages.push(
			createGithubActionsUsage(
				repoFullName,
				definition.githubActionsUses,
				definition.workflowPath ?? defaultWorkflowPath,
			),
		);

		if (definition.id === invalidWorkflowRepoId) {
			acc.githubWorkflows.push(
				createInvalidGithubWorkflow(
					repoBundle.repositoryId,
					primaryWorkflowId + 1n,
				),
			);
		}

		for (const { teamSlug, roleName } of definition.owners) {
			const teamId = teamIdsBySlug.get(teamSlug);
			if (!teamId) {
				throw new Error(`Missing seeded team: ${teamSlug}`);
			}

			acc.teamRepos.push(
				createRepoOwnership(repoBundle.repo, teamId, roleName),
			);
		}

		addOptionalSeedData(acc, definition);

		return acc;
	}, createEmptySeedData());
}
