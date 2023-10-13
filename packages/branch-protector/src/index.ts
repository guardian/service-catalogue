import type { Octokit } from 'octokit';
import { getEvents, notify } from './aws-requests';
import { getConfig } from './config';
import type { Config } from './config';
import {
	getDefaultBranchName,
	getGithubClient,
	isBranchProtected,
	updateBranchProtection,
} from './github-requests';
import type { UpdateBranchProtectionEvent } from './model';

async function protectBranch(
	octokit: Octokit,
	config: Config,
	event: UpdateBranchProtectionEvent,
) {
	const [owner, repo] = event.fullName.split('/');

	if (!owner || !repo) {
		throw new Error(`Invalid repo name: ${event.fullName}`);
	}

	const defaultBranchName = await getDefaultBranchName(owner, repo, octokit);
	const branchIsProtected = await isBranchProtected(
		octokit,
		owner,
		repo,
		defaultBranchName,
	);

	console.log(`${repo} branch protection: ${branchIsProtected.toString()}`);

	const stageIsProd = config.stage === 'PROD';

	if (branchIsProtected && stageIsProd) {
		console.log(`No action required`);
	} else if (!branchIsProtected && stageIsProd) {
		await updateBranchProtection(octokit, owner, repo, defaultBranchName);
		console.log(`Updated ${repo}'s default branch protection`);
		for (const slug of event.teamNameSlugs) {
			await notify(event.fullName, config.anghammaradSnsTopic, slug);
		}
		console.log(`Notified teams`);
	} else {
		// !stageIsProd
		console.log(`Detected stage: ${config.stage}. No action taken.`);
	}
}

export async function main() {
	const config: Config = await getConfig();
	const octokit: Octokit = await getGithubClient(config);

	const events = await getEvents(1, config);
	for (const event of events) {
		await protectBranch(octokit, config, event);
	}
}
