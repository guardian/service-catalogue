import type { components } from '@octokit/openapi-types';
import type { Octokit } from 'octokit';
import type { Config } from './config.js';

type SearchResultItem = components['schemas']['commit-search-result-item'];
type Result = {
	repository: string;
	message: string;
	author: string;
	url: string;
};

export async function searchHuludCommits(
	octokit: Octokit,
	config: Config,
	keyword: string = 'hulud',
	minutes: number = 60,
) {
	const timestamp = new Date();
	timestamp.setMinutes(timestamp.getMinutes() - minutes);
	const dateString = timestamp.toISOString();

	const response = await octokit.request('GET /search/commits', {
		headers: {
			'X-GitHub-Api-Version': '2022-11-28', //TODO deduplicate across the codebase
		},
		q: `org:${config.gitHubOrg} ${keyword} committer-date:>=${dateString}`,
		per_page: 100,
	});

	const items: SearchResultItem[] = response.data.items;
	const shortItems: Result[] = items.map((item) => ({
		repository: item.repository.full_name,
		message: item.commit.message,
		author: item.commit.author.name,
		url: item.html_url,
	}));

	if (shortItems.length > 0) {
		console.log(
			`Found ${shortItems.length} commits with keyword "${keyword}" in the last ${minutes} minutes:`,
		);
		for (const item of shortItems) {
			console.log(
				`- [${item.repository}](${item.url}) by ${item.author}: ${item.message}`,
			);
		}
	} else {
		console.log(
			`No commits found with keyword "${keyword}" in the last ${minutes} minutes.`,
		);
	}

	return shortItems;
}
