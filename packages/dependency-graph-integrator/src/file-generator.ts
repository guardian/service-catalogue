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
				'runs-on': 'ubuntu-latest',
				steps: [
					{
						name: 'Checkout branch',
						id: 'checkout',
						uses: 'actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7',
					},
					{
						name: 'Submit dependencies',
						id: 'submit',
						uses: 'scalacenter/sbt-dependency-submission@7ebd561e5280336d3d5b445a59013810ff79325e # v3.0.1',
					},
					{
						name: 'Log snapshot for user validation',
						id: 'validate',
						run: 'cat ${{ steps.submit.outputs.snapshot-json-path }} | jq',
					},
				],
				permissions: { contents: 'write' },
			},
		},
	};

	return stringify(dependencyGraphWorkflowJson, { lineWidth: 120 })
		.replace('{}', '')
		.replaceAll('"', '');
}

function createPRChecklist(branchName: string): string[] {
	const step1 =
		'Ensure that the [version of sbt in the project is v1.5 or above](https://github.com/scalacenter/sbt-dependency-submission?tab=readme-ov-file#support) in order for the dependency submission action to run.';

	const step2 =
		'A run of this action should have been triggered when the branch was ' +
		'created. Sense check the output of "Log snapshot for user validation", ' +
		'and make sure that your dependencies look okay.';

	const step3 =
		`When you are happy the action works, remove the branch name \`${branchName}\`` +
		'trigger from the the yaml file (aka delete line 6), approve, and merge. ';

	return [step1, step2, step3];
}

export function generatePrBody(branchName: string, repoName: string): string {
	const body = [
		h2('What does this change?'),
		p(
			'This PR sends your sbt dependencies to GitHub for vulnerability monitoring via Dependabot. ' +
				`The submitted dependencies will appear in the [Dependency Graph](https://github.com/guardian/${repoName}/network/dependencies) ` +
				'on merge to main (it might take a few minutes to update).',
		),
		h2('Why?'),
		p(
			'If a repository is in production, we need to track its third party dependencies for vulnerabilities. ' +
				'Historically, we have done this using Snyk, but we are now moving to GitHub’s native Dependabot. ' +
				'Scala is not a language that Dependabot supports out of the box, this workflow is required to make it happen. ' +
				'As a result, we have raised this PR on your behalf to add it to the Dependency Graph.',
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
