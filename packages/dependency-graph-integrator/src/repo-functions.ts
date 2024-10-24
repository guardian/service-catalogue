import type { Octokit } from 'octokit';
import type { StatusCode } from './types';

const OWNER = 'guardian';

const ghHeaders = { 'X-GitHub-Api-Version': '2022-11-28' };

export async function enableDependabotAlerts(
	repo: string,
	octokit: Octokit,
): Promise<StatusCode> {
	console.log(`Enabling Dependabot alerts for ${repo}`);
	const enableResponse = await octokit.request(
		'PUT /repos/{owner}/{repo}/vulnerability-alerts',
		{
			owner: OWNER,
			repo,
			headers: ghHeaders,
		},
	);
	return enableResponse.status;
}
