import { Octokit } from 'octokit';

const authToken = process.env.GITHUB_ACCESS_TOKEN;

export async function main() {
	const octokit = new Octokit({ auth: authToken });

	const data = await octokit.auth();

	console.log(data);
}
