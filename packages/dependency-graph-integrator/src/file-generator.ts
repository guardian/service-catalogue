import { markdownChecklist } from 'common/src/string';
import { h2, p, tsMarkdown } from 'ts-markdown';
import { stringify } from 'yaml';

export function createYaml(prBranch: string): string {
	const dependencyGraphWorkflowJson = {
		name: 'Update Dependency Graph for SBT',
		on: {
			push: {
				branches: ['main', prBranch],
			},
			workflow_dispatch: {}, //There isn't an elegant way to do this in TypeScript, so we'll remove the {} at the end
		},
		jobs: {
			'dependency-graph': {
				// 'runs-on': 'ubuntu-latest', //let's see how we do without this
				steps: [
					{ uses: 'actions/checkout@v4' },
					{
						uses: 'guardian/.github/.github/workflows/dependency-graph.yml@main',
					},
				],
				permissions: { contents: 'write' },
			},
		},
	};

	return stringify(dependencyGraphWorkflowJson, { lineWidth: 120 }).replace(
		'{}',
		'',
	);
}

function createPRChecklist(branchName: string): string[] {
	const step1 =
		'A run of this action should have been triggered when the branch was ' +
		'created. Go to Insights -> Dependency graph and sense check a few of ' +
		'your dependencies to make sure they show up. There may be a short delay ' +
		'between submission and them appearing in the UI.';
	const step2 =
		`When you are happy the action works, remove the branch name \`${branchName}\`` +
		'trigger from the the yaml file (aka delete line 6), approve, and merge.';
	return [step1, step2];
}

export function generatePrBody(branchName: string): string {
	const body = [
		h2('What does this change?'),
		p(
			'This PR sends your sbt dependencies to GitHub for vulnerability monitoring via Dependabot. ',
		),
		h2('Why?'),
		p(
			'If a repository is in production, we need to track its third party dependencies for vulnerabilities. ' +
				'Historically, we have done this using Snyk, but we are now moving to GitHub’s native Dependabot. ' +
				'Scala is not a language that Dependabot supports out of the box, this workflow is required to make it happen' +
				'As a result, we have raised this PR on your behalf to add it to Snyk.',
		),
		h2('How has it been verified?'),
		p(
			'We have tested this workflow, and the process of raising a PR on DevX repos, and have verified that it works. ' +
				'However, we have included some instructions below to help you verify that it works for you. ' +
				'Please do not hesitate to contact DevX Security if you have any questions or concerns.',
		),
		h2('What do I need to do?'),
		markdownChecklist(createPRChecklist(branchName)),
	];
	return tsMarkdown(body);
}
