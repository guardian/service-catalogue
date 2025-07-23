import type { IAllBestPractice, IBestPractice } from './types.js';

const devXSecurity =
	'[DevX Security](https://github.com/orgs/guardian/teams/devx-security)';
const devXOperations =
	'[DevX Operations](https://github.com/orgs/guardian/teams/devx-operations)';
const guardian = '[@guardian](https://github.com/orgs/guardian/teams/all)';

const repository: readonly IBestPractice[] = [
	{
		name: 'Default Branch Name',
		owner: guardian,
		description: 'The default branch name should be `main`.',
		howToCheck:
			'[Repocop compliance dashboard](https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?orgId=1&refresh=15m&var-team=All&var-rule=default_branch_name)',
		howToExempt: 'Archived repositories are exempt.',
		remediation:
			'Manual - see [How to rename an existing branch](https://github.com/github/renaming#renaming-existing-branches)',
	},
	{
		name: 'Branch Protection',
		owner: guardian,
		description:
			'Enable branch protection for the default branch, ensuring changes are reviewed before being deployed.',
		howToCheck:
			'[Repocop compliance dashboard](https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?orgId=1&refresh=15m&var-team=All&var-rule=branch_protection)',
		howToExempt:
			'Archived repositories are exempt. Repositories without a production or documentation topic are exempt.',
		remediation:
			'Repocop applies branch protection automatically in batches - teams informed via Anghammarad',
	},
	{
		name: 'Team-based Access',
		owner: guardian,
		description:
			'Grant access on a team basis, rather than directly to individuals.',
		howToCheck: 'Manual. View the repository on https://github.com',
		howToExempt:
			'Repositories with one of following topics are exempt: `hackday`, `learning`, `prototype`, `interactive`.',
		remediation: 'Manual',
	},
	{
		name: 'Admin Access',
		owner: guardian,
		description:
			'Grant at least one GitHub team Admin access - typically, the dev team that own the project.',
		howToCheck:
			'[Repocop compliance dashboard](https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?orgId=1&refresh=15m&var-team=All&var-rule=admin_access)',
		howToExempt:
			'Repositories with one of following topics are exempt: `hackday`, `learning`, `prototype`. Archived repositories are exempt.',
		remediation: 'Manual',
	},
	{
		name: 'Archiving',
		owner: devXOperations,
		description: 'Repositories that are no longer used should be archived.',
		howToCheck:
			'[Repocop compliance dashboard](https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?orgId=1&refresh=15m&var-team=All&var-rule=archiving)',
		howToExempt: 'Repositories with an `interactive` topic are exempt.',
		remediation:
			'Manual - DevX may contact you to discuss archiving if your repo has been inactive for over two years',
	},
	{
		name: 'Topics',
		owner: devXSecurity,
		description:
			'Repositories should have one of the following topics, to help understand what is in production. `production`, `testing`, `documentation`, `hackday`, `prototype`, `learning`, `interactive`',
		howToCheck:
			'[Repocop compliance dashboard](https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?orgId=1&refresh=15m&var-team=All&var-rule=topics)',
		howToExempt: 'Archived repositories are exempt.',
		remediation: `Mainly manual - Repocop may automatically apply the 'production' topic to repos that are found to have a stack in AWS with PROD/INFRA tags - teams informed via Anghammarad`,
	},
	{
		name: 'Contents',
		owner: devXSecurity,
		description:
			'Never commit secret information. Avoid private information in public repositories.',
		howToCheck: 'Manual. View the repository on https://github.com',
		howToExempt: 'N/A',
		remediation: 'Manual removal',
	},
	{
		name: 'Stacks',
		owner: devXSecurity,
		description:
			'Archived repositories should not have corresponding stacks on AWS.',
		howToCheck: 'Manual. View the repository on https://github.com',
		howToExempt: 'N/A',
		remediation: 'Manual removal of stack on AWS',
	},
	{
		name: 'Vulnerability Tracking',
		owner: guardian,
		description:
			'Repositories should have their dependencies tracked via Dependabot, depending on the languages present.',
		howToCheck:
			'[Repocop compliance dashboard](https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?orgId=1&refresh=15m&var-team=All&var-rule=vulnerability_tracking)',
		howToExempt:
			'All archived repos and all repos without a production tag are exempt.',
		remediation:
			'Enable Dependency Graph in GitHub which will enable Dependabot.',
	},
] as const satisfies readonly IBestPractice[];

const aws: readonly IBestPractice[] = [
	{
		name: 'Resource Tagging',
		owner: devXOperations,
		description:
			'AWS resources should be tagged (where supported) with `Stack`, `Stage`, and `App`.<br>This aids service discovery, and cost allocation.',
		howToCheck: 'TBD',
		howToExempt: 'N/A',
		remediation:
			'Migration to [Guardian CDK](https://github.com/guardian/cdk/blob/main/docs/migration-guide.md)',
	},
] as const satisfies readonly IBestPractice[];

const galaxiesPerson: readonly IBestPractice[] = [
	{
		name: 'GitHub Usernames',
		owner: devXOperations,
		description: `Each developer's Galaxies profile should contain their GitHub username`,
		howToCheck: 'View on Galaxies',
		howToExempt:
			'Your Galaxies role is something other than an engineer/data analyst',

		remediation:
			'Use [Galaxies profile update form](https://forms.gle/7Yye3KfHefgYqg3c7)',
	},
];

const galaxiesTeam: readonly IBestPractice[] = [
	{
		name: 'Github Team',
		owner: devXOperations,
		description:
			'Teams should have their GitHub team names in their Galaxies entry',
		howToCheck:
			'Check in [this file](https://github.com/guardian/galaxies/blob/main/shared/data/teams.ts) in the Galaxies repo',
		howToExempt: "Teams that don't use GitHub are exempt",
		remediation: 'Manual via PR',
	},
	{
		name: 'Team Emails',
		owner: devXOperations,
		description: 'A team on Galaxies should have an email address entry',
		howToCheck:
			'Check in [this file](https://github.com/guardian/galaxies/blob/main/shared/data/teams.ts) in the Galaxies repo',
		howToExempt: 'N/A',
		remediation: 'Manual via PR',
	},
	{
		name: 'Team Channels',
		owner: devXOperations,
		description:
			'A team on Galaxies should have a public chat channel key listed',
		howToCheck:
			'Check in [this file](https://github.com/guardian/galaxies/blob/main/shared/data/teams.ts) in the Galaxies repo',
		//We rely on this information this for repocop alerts, so only teams that have repos are relevant at this stage
		howToExempt:
			"It's generally good practice to do this, but teams that don't use GitHub are exempt",
		remediation: 'Manual via PR',
	},
] as const satisfies readonly IBestPractice[];

export const AllBestPractices: IAllBestPractice = {
	Repository: repository,
	AWS: aws,
	GalaxiesPerson: galaxiesPerson,
	GalaxiesTeam: galaxiesTeam,
};
