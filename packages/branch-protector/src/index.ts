import { Octokit } from 'octokit';

//TODO: move to a common place
function getEnvOrThrow(key: string): string {
	const value = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

const authToken: string = getEnvOrThrow('GITHUB_ACCESS_TOKEN');

async function isMainBranchProtected(
	octokit: Octokit,
	fullRepoName: string,
): Promise<boolean> {
	const owner = fullRepoName.split('/')[0]!;
	const repo = fullRepoName.split('/')[1]!;
	const data = await octokit.rest.repos.get({ owner: owner, repo: repo });
	const branch = data.data.default_branch;
	const branchData = await octokit.rest.repos.getBranch({
		owner,
		repo,
		branch,
	});
	return branchData.data.protected;
}

export async function main() {
	const octokit: Octokit = new Octokit({ auth: authToken });

	const exampleRepo = 'guardian/service-catalogue';
	const isProtected: boolean = await isMainBranchProtected(
		octokit,
		exampleRepo,
	);
	console.log(`Is ${exampleRepo} protected? ${isProtected.toString()}`);
}
