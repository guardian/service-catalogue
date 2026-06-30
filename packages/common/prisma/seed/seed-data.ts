/**
 * Declarative seed fixtures for local development.
 *
 * This module contains seeded teams, repositories, workflow fixture content,
 * and scenario-specific identifiers used by seed assembly.
 */
import type { RepoDefinition, RoleName, TeamSlug } from './seed-types.js';

/**
 * Builds a repository ownership fixture entry with a default admin role.
 */
const owner = (
	teamSlug: TeamSlug,
	roleName: RoleName = 'admin',
): { teamSlug: TeamSlug; roleName: RoleName } => ({ teamSlug, roleName });

const githubActionUses = {
	node: ['actions/checkout@v2', 'actions/setup-node@v2'],
	scala: ['actions/checkout@v2', 'actions/setup-scala@v1'],
	python: ['actions/checkout@v2', 'actions/setup-python@v2'],
	go: ['actions/checkout@v2', 'actions/setup-go@v2'],
} as const;

export const repoDefinitions: readonly RepoDefinition[] = [
	{
		id: 1,
		name: 'dotcom-rendering',
		languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Shell'],
		owners: [owner('frontend')],
		githubActionsUses: githubActionUses.node,
		cloudFormation: true,
	},
	{
		id: 2,
		name: 'janus-app',
		languages: ['Scala', 'Dockerfile', 'Shell'],
		owners: [owner('backend'), owner('devops')],
		githubActionsUses: githubActionUses.scala,
		cloudFormation: true,
		customProperties: true,
	},
	{
		id: 3,
		name: 'fsbp-fix',
		languages: ['Go', 'Shell'],
		owners: [owner('devops')],
		githubActionsUses: githubActionUses.python,
	},
	{
		id: 4,
		name: 'cricket',
		languages: ['Python', 'Terraform', 'Shell'],
		owners: [owner('cricket')],
		githubActionsUses: githubActionUses.go,
		cloudFormation: true,
	},
];

export const teamDefinitions = [
	{ id: 1, slug: 'frontend' },
	{ id: 2, slug: 'backend' },
	{ id: 3, slug: 'devops' },
	{ id: 4, slug: 'cricket' },
] as const satisfies ReadonlyArray<{ id: number; slug: TeamSlug }>;

export const invalidWorkflowPath = 'broken.yaml';

export const invalidWorkflowContents = `name: Broken
on: [push
jobs:
  broken:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`;

export const invalidWorkflowRepoId = 1;
