import { randomBytes } from 'crypto';
import type { Octokit } from 'octokit';
import { h2, p, tsMarkdown } from 'ts-markdown';
import { stringify } from 'yaml';
import { createPullRequest } from './pull-requests';

export function createYaml(languages: string[], prBranch: string): string {
	const dependencyGraphWorkflowJson = {
		name: 'Update Dependency Graph',
		on: {
			push: {
				branches: ['main', prBranch],
			},
			workflow_dispatch: {}, //There isn't an elegant way to do this in TypeScript, so we'll remove the {} at the end
		},
		jobs: {
			'dependency-graph': {
				name: 'Update Dependency Graph',
				// 'runs-on': 'ubuntu-latest',
				steps: [
					{ uses: 'actions/checkout@v4' },
					{ uses: 'scalacenter/sbt-dependency-submission@v2' },
				],
				permissions: { contents: 'write' },
			},
		},
	};

	return stringify(dependencyGraphWorkflowJson, { lineWidth: 120 }).replace(
		'{}',
		'',
	);
	//.replaceAll(`"`, '');
}

function checklist(items: string[]): string {
	return items.map((item) => `- [ ] ${item}`).join('\n');
}

//TODO test the python text only shows up when it's supposed to.
function createPRChecklist(branchName: string): string[] {
	const step1 =
		'An run of this action should have been triggered when the branch was ' +
		'created. Go to Insights -> Dependency graph and sense check a few of ' +
		'your dependencies to make sure they show up. There may be a short delay ' +
		'between submission and them appearing in the UI.';
	const step2 =
		`When you are happy the action works, remove the branch name \`${branchName}\`` +
		'trigger from the the yaml file (aka delete line 6), approve, and merge.';
	return [step1, step2];
}

function generatePrBody(branchName: string): string {
	const body = [
		h2('What does this change?'),
		p(
			'This PR integrates your repository with Snyk, to track its dependencies, in line with our recommendations.',
		),
		h2('Why?'),
		p(
			'If a repository is in production, we need to track its third party dependencies for vulnerabilities. ' +
				'DevX have detected that your repo contains at least one language that is not supported by Dependabot. ' +
				'As a result, we have raised this PR on your behalf to add it to Snyk.',
		),
		h2('How has it been verified?'),
		p(
			'We have tested this action against a combination of TypeScript, Scala, Go, and Python repositories. ' +
				'If your repository contains other languages not included here, integration may not work the way you expect it to.',
		),
		h2('What do I need to do?'),
		checklist(createPRChecklist(branchName)),
	];
	return tsMarkdown(body);
}

export function generatePr(
	repoLanguages: string[],
	branch: string,
): [string, string] {
	const workflowLanguages = [
		'Scala',
		'TypeScript',
		'JavaScript',
		'Python',
		'Go',
	];

	//intersection of repo languages and workflow-supported languages
	const workflowSupportedLanguages = repoLanguages.filter((lang) =>
		workflowLanguages.includes(lang),
	);

	if (workflowSupportedLanguages.length === 0) {
		throw new Error('No supported languages provided, cannot generate PR');
	}

	const header =
		'Submit sbt dependencies to GitHub for vulnerability monitoring';
	const body = generatePrBody(branch);

	return [header, body];
}

export async function createSnykPullRequest(
	octokit: Octokit,
	repoName: string,
	branchName: string,
	repoLanguages: string[],
) {
	const snykFileContents = createYaml(repoLanguages, branchName);
	const [title, body] = generatePr(repoLanguages, branchName);
	return await createPullRequest(octokit, {
		repoName,
		title,
		body,
		branchName,
		changes: [
			{
				commitMessage: 'Add snyk.yaml',
				files: {
					'.github/workflows/snyk.yaml': snykFileContents,
				},
			},
		],
	});
}

export function generateBranchName() {
	return `integrate-snyk-${randomBytes(8).toString('hex')}`;
}
