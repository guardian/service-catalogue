import { markdownChecklist } from 'common/src/string.js';
import type { DepGraphLanguage } from 'common/types.js';
import { h2, p, tsMarkdown } from 'ts-markdown';
import { stringify } from 'yaml';

export const depGraphPackageManager: Record<DepGraphLanguage, string> = {
	Scala: 'sbt',
	Kotlin: 'Gradle',
};

function createLanguageSpecificWorkflowSteps(
	repo: string,
): Record<DepGraphLanguage, ConcatArray<object>> {
	return {
		Scala: [
			{
				name: 'Checkout branch',
				id: 'checkout',
				uses: 'actions/checkout@eef61447b9ff4aafe5dcd4e0bbf5d482be7e7871 # v4.2.1',
			},
			{
				name: 'Install Java',
				id: 'java',
				uses: 'actions/setup-java@b36c23c0d998641eff861008f374ee103c25ac73 # v4.2.0',
				with: {
					distribution: 'corretto',
					'java-version': '21',
				},
			},
			{
				name: 'Install sbt',
				id: 'sbt',
				uses: 'sbt/setup-sbt@8a071aa780c993c7a204c785d04d3e8eb64ef272 # v1.1.0',
			},
			{
				name: 'Submit dependencies',
				id: 'submit',
				uses: 'scalacenter/sbt-dependency-submission@64084844d2b0a9b6c3765f33acde2fbe3f5ae7d3 # v3.1.0',
			},
			{
				name: 'Log snapshot for user validation',
				id: 'validate',
				run: 'cat ${{ steps.submit.outputs.snapshot-json-path }} | jq',
			},
		],
		Kotlin: [
			{
				name: 'Checkout branch',
				id: 'checkout',
				uses: 'actions/checkout@eef61447b9ff4aafe5dcd4e0bbf5d482be7e7871 # v4.2.1',
			},
			{
				name: 'Set up Java',
				id: 'setup',
				uses: 'actions/setup-java@99b8673ff64fbf99d8d325f52d9a5bdedb8483e9 # v4.2.1',
				with: {
					distribution: 'temurin',
					'java-version': '21',
				},
			},
			{
				name: 'Submit dependencies',
				id: 'submit',
				uses: 'gradle/actions/dependency-submission@d156388eb19639ec20ade50009f3d199ce1e2808 # v4.1.0',
			},
			{
				name: 'Log snapshot for user validation',
				id: 'validate',
				run: `cat /home/runner/work/${repo}/${repo}/dependency-graph-reports/update_dependency_graph_for_gradle-dependency-graph.json | jq`,
			},
		],
	};
}

export function createYaml(
	prBranch: string,
	language: DepGraphLanguage,
	repo: string,
): string {
	const dependencyGraphWorkflowJson = {
		name: `Update Dependency Graph for ${depGraphPackageManager[language]}`,
		on: {
			push: {
				branches: ['main', prBranch],
			},
			workflow_dispatch: {}, //There isn't an elegant way to do this in TypeScript, so we'll remove the {} at the end
		},
		jobs: {
			'dependency-graph': {
				'runs-on': 'ubuntu-latest',
				steps: createLanguageSpecificWorkflowSteps(repo)[language],
				permissions: { contents: 'write' },
			},
		},
	};

	return stringify(dependencyGraphWorkflowJson, { lineWidth: 120 })
		.replaceAll('{}', '')
		.replaceAll('"', '');
}

const stepsForLanguages: Record<DepGraphLanguage, string> = {
	Scala:
		'Ensure that the [version of sbt in the project is v1.5 or above](https://github.com/scalacenter/sbt-dependency-submission?tab=readme-ov-file#support) in order for the dependency submission action to run.',

	Kotlin:
		'Ensure that the [version of Gradle is v5.2 or above](https://github.com/gradle/actions/blob/main/docs/dependency-submission.md#gradle-version-compatibility)',
};

const languageSpecificInfo: Record<DepGraphLanguage, string> = {
	Scala:
		'See [the sbt workflow documentation](https://github.com/scalacenter/sbt-dependency-submission?tab=readme-ov-file) for further information and configuration options.',
	Kotlin:
		'See [the Gradle workflow documentation](https://github.com/gradle/actions/blob/main/docs/dependency-submission.md) for further information and configuration options, and the [FAQ for troubleshooting](https://github.com/gradle/actions/blob/main/docs/dependency-submission-faq.md).',
};

function createPRChecklist(
	branchName: string,
	stepsForLanguage: string,
	language: DepGraphLanguage,
	yamlFilename: string,
): string[] {
	const finalSteps = [
		`A run of this action (Update Dependency Graph for ${depGraphPackageManager[language]}) ` +
			`should have been triggered (see the checks below) when the branch \`${branchName}\` ` +
			'was created. Sense check the output of the step "Log snapshot for user ' +
			'validation", and make sure that your dependencies look okay.',
		`When you are happy the action works, remove the branch name trigger \`${branchName}\` ` +
			`from the file \`${yamlFilename}-dependency-graph.yaml\` ` +
			`(aka delete line 6), approve this PR, and merge. `,
	];
	return [stepsForLanguage, ...finalSteps];
}

export function generatePrBody(
	branchName: string,
	repoName: string,
	language: DepGraphLanguage,
): string {
	const yamlFilename = depGraphPackageManager[language];

	const body = [
		h2('What does this change?'),
		p(
			`This PR sends your ${depGraphPackageManager[language]} dependencies to GitHub for vulnerability monitoring via Dependabot. ` +
				`The submitted dependencies will appear in the [Dependency Graph](https://github.com/guardian/${repoName}/network/dependencies) ` +
				'on merge to main (it might take a few minutes to update).',
		),
		h2('What do I need to do?'),
		markdownChecklist(
			createPRChecklist(
				branchName,
				stepsForLanguages[`${language}`],
				language,
				yamlFilename,
			),
		),
		h2('Why?'),
		p(
			'If a repository is in production, we need to track its third party dependencies for vulnerabilities. ' +
				'Historically, we have done this using Snyk, but we have migrated to GitHub’s native Dependabot. ' +
				`${language} is not a language that Dependabot supports out of the box, this workflow is required to make it happen. ` +
				'As a result, we have raised this PR on your behalf to add it to the Dependency Graph.',
		),
		h2('How has it been verified?'),
		p(
			'We have tested this workflow, and the process of raising a PR on DevX repos, and have verified that it works. ' +
				'However, we have included some instructions above to help you verify that it works for you. ' +
				'Please do not hesitate to contact DevX Security if you have any questions or concerns.',
		),
		h2(`Further information for ${depGraphPackageManager[language]}`),
		p(languageSpecificInfo[`${language}`]),
	];
	return tsMarkdown(body);
}
