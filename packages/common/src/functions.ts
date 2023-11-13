import { fromIni } from '@aws-sdk/credential-providers';
import type { Action } from '@guardian/anghammarad';

export function branchProtectionCtas(
	fullRepoName: string,
	teamSlug: string,
): Action[] {
	const githubUrl = `https://github.com/${fullRepoName}`;
	const grafanaUrl = `https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=${teamSlug}&var-rule=All&orgId=1`;
	const protectionUrl = `https://github.com/${fullRepoName}/settings/branches`;

	return [
		{ cta: 'Repository', url: githubUrl },
		{
			cta: 'Compliance information for repos',
			url: grafanaUrl,
		},
		{
			cta: 'Branch protections',
			url: protectionUrl,
		},
	];
}

export function anghammaradThreadKey(fullRepoName: string) {
	return `service-catalogue-${fullRepoName.replaceAll('/', '-')}`;
}

export function shuffle<T>(array: T[]): T[] {
	return array.sort(() => Math.random() - 0.5);
}

export function getLocalProfile(stage: string) {
	return stage === 'DEV' ? fromIni({ profile: 'deployTools' }) : undefined;
}
