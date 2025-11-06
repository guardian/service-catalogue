/**
 * Tables collected with https://hub.cloudquery.io/plugins/source/cloudquery/github
 * These tables require organization-level access.
 */
export const githubTables = [
	'github_issues',
	'github_organization_members',
	'github_organizations',
	'github_releases',
	'github_repositories',
	'github_repository_branches',
	'github_repository_collaborators',
	'github_repository_custom_properties',
	'github_repository_sboms',
	'github_secret_scanning_alerts',
	'github_team_members',
	'github_team_repositories',
	'github_teams',
	'github_workflows',
] as const;

/**
 * Tables collected with https://hub.cloudquery.io/plugins/source/cloudquery/github
 * These tables require enterprise-level access.
 * Enterprise access is managed separately from organization access, and a GitHub app cannot have both at the same time.
 * See: https://docs.github.com/en/enterprise-cloud@latest/apps/using-github-apps/installing-a-github-app-on-your-enterprise#about-installing-github-apps-on-your-enterprise
 */
export const githubEnterpriseTables = ['github_saml_identities'] as const;

/**
 * Tables collected with https://github.com/guardian/cq-source-github-languages
 */
export const githubLanguagesTables = ['github_languages'] as const;
