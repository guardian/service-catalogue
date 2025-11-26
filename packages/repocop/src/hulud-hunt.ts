import type { components } from '@octokit/openapi-types';
import type { Octokit } from 'octokit';
import type { Config } from './config.js';

type SearchResultItem = components['schemas']['commit-search-result-item'];

export async function searchHuludCommits(
	octokit: Octokit,
	config: Config,
	keyword: string = 'hulud',
) {
	const oneDayAgo = new Date();
	oneDayAgo.setDate(oneDayAgo.getDate() - 1);
	const dateString = oneDayAgo.toISOString();

	const response = await octokit.request('GET /search/commits', {
		headers: {
			'X-GitHub-Api-Version': '2022-11-28', //TODO deduplicate across the codebase
		},
		q: `org:${config.gitHubOrg} ${keyword} committer-date:>=${dateString}`,
		per_page: 100,
	});

	const items: SearchResultItem[] = response.data.items;
	const shortItems = items.map((item) => ({
		repository: item.repository.full_name,
		message: item.commit.message,
		author: item.commit.author.name,
		url: item.html_url,
	}));

	return shortItems;
}
