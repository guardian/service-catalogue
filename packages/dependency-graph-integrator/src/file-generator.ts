import fs from 'fs/promises';
import { markdownChecklist } from 'common/src/string.js';
import type { DepGraphLanguage } from 'common/types.js';
import { h2, p, tsMarkdown } from 'ts-markdown';
import yaml from 'yaml';
import type { Pair } from 'yaml';

interface WorkflowJob {
	'runs-on': string;
	steps: object[];
	permissions?: { contents: string };
}

interface Workflow {
	name: string;
	on: object;
	jobs: Record<string, WorkflowJob>;
	'shared-steps'?: object[];
}

export const depGraphPackageManager: Record<DepGraphLanguage, string> = {
	Scala: 'sbt',
	Kotlin: 'Gradle',
};

function keyOrder(a: Pair, b: Pair) {
	const order = ['name', 'on', 'jobs', 'permissions'];
	const ai = order.indexOf(String(a.key));
	const bi = order.indexOf(String(b.key));
	if (ai === -1 && bi === -1) {
		return String(a.key).localeCompare(String(b.key));
	}
	if (ai === -1) {
		return 1;
	}
	if (bi === -1) {
		return -1;
	}
	return ai - bi;
}

export async function createYaml(prBranch: string, language: DepGraphLanguage) {
	const template = await fs.readFile(
		'../../.github/workflows/template_dependency_submission.yaml',
		'utf-8',
	);

	const usesCommentMap = new Map<string, string>();
	const usesRegex = /^(\s*uses:\s*[^\s]+@[^\s]+)(\s*#\s*v[^\s]+)?/gm;
	let match;
	while ((match = usesRegex.exec(template)) !== null) {
		if (typeof match[1] === 'string') {
			const usesLine = match[1].trim();
			const comment = match[2] ?? '';
			usesCommentMap.set(usesLine, comment);
		}
	}

	const workflow = yaml.parse(template) as Workflow;
	const sharedSteps = workflow.jobs['shared-steps']?.steps ?? [];
	const jobKey = `${language.toLowerCase()}-job`;
	const selectedJob = workflow.jobs[jobKey];

	if (!selectedJob) {
		throw new Error(`Job key "${jobKey}" not found in workflow template.`);
	}

	selectedJob.steps = [...sharedSteps, ...selectedJob.steps];

	workflow.name = `Update Dependency Graph for ${depGraphPackageManager[language]}`;

	workflow.on = {
		push: {
			branches: ['main', prBranch],
		},
		workflow_dispatch: {}, //There isn't an elegant way to do this in TypeScript, so we'll remove the {} at the end
	};

	workflow.jobs = { 'dependency-graph': selectedJob };

	selectedJob.permissions = { contents: 'write' };

	delete workflow.jobs['shared-steps'];

	let outputYaml = yaml
		.stringify(workflow, { sortMapEntries: keyOrder })
		.replaceAll('{}', '');

	outputYaml = outputYaml.replace(
		/^(\s*uses:\s*[^\s]+@[^\s]+)(?!\s*#\s*v[^\s]+)$/gm,
		(_line: string, usesLine: string) => {
			const comment = usesCommentMap.get(usesLine.trim()) ?? '';
			return usesLine + comment;
		},
	);

	return outputYaml;
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
