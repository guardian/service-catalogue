import { markdownChecklist } from 'common/src/string';
import { h2, p, tsMarkdown } from 'ts-markdown';
import { stringify } from 'yaml';

interface SnykInputs {
	ORG: string;
	SKIP_SBT?: boolean;
	SKIP_NODE?: boolean;
	SKIP_PYTHON?: boolean;
	PYTHON_VERSION?: string;
	PIP_REQUIREMENTS_FILES?: string;
	PIPFILES?: string;
	SKIP_GO?: boolean;
}

interface SnykSchema {
	name: string;
	on: {
		push: {
			branches: string[];
		};
		workflow_dispatch: object;
	};
	jobs: {
		security: {
			uses: string;
			with: SnykInputs;
			secrets: {
				SNYK_TOKEN: string;
			};
		};
	};
}

export function createYaml(languages: string[], prBranch: string): string {
	const inputs: SnykInputs = {
		ORG: '<SNYK_ORG_ID>',
		SKIP_SBT: languages.includes('Scala') ? undefined : true,
		SKIP_NODE:
			languages.includes('TypeScript') || languages.includes('JavaScript')
				? undefined
				: true,
		SKIP_PYTHON: languages.includes('Python') ? false : undefined,
		PYTHON_VERSION: languages.includes('Python') ? '<MAJOR.MINOR>' : undefined,
		PIP_REQUIREMENTS_FILES: languages.includes('Python')
			? '<PATH_TO_REQUIREMENTS> # Space separated list of requirements files. Only use one of this or PIPFILES'
			: undefined,
		PIPFILES: languages.includes('Python')
			? '<PATH_TO_PIPFILES> # Space separated list of pipfiles. Only use one of this or PIP_REQUIREMENTS_FILES'
			: undefined,
		SKIP_GO: languages.includes('Go') ? false : undefined,
	};

	const snykWorkflowJson: SnykSchema = {
		name: 'Snyk',
		on: {
			push: {
				branches: ['main', prBranch],
			},
			workflow_dispatch: {}, //There isn't an elegant way to do this in TypeScript, so we'll remove the {} at the end
		},
		jobs: {
			security: {
				uses: 'guardian/.github/.github/workflows/sbt-node-snyk.yml@main',
				with: inputs,
				secrets: {
					SNYK_TOKEN: '${{ secrets.SNYK_TOKEN }}',
				},
			},
		},
	};

	return stringify(snykWorkflowJson, { lineWidth: 120 })
		.replace('{}', '')
		.replaceAll(`"`, '');
}

function generatePrHeader(languages: string[]): string {
	return `Integrate ${languages.join(', ')} projects with Snyk`;
}

//TODO test the python text only shows up when it's supposed to.
function createPRChecklist(languages: string[], branchName: string): string[] {
	const pythonText = ['Replace the relevant python fields'];
	const step1 =
		'Replace the SNYK_ORG variable with the org name that your team ' +
		'already uses (you should have other repos integrated with Snyk. ' +
		'If you can’t find any, reach out to DevX). Examples are ' +
		'`guardian-devtools` and `guardian-dotcom-n2y`';
	const step2 =
		'The Snyk job should run automatically on every commit to this branch. ' +
		'Click through on the Snyk status check see the logs of the latest run on ' +
		'this PR, and verify it has generated one project per dependency manifest ' +
		'(except pnpm and deno). ' +
		'Examples of dependency manifests are a build.sbt, or a package-lock.json, ' +
		'essentially, any file that lists the dependencies of your project.';
	const step3 =
		`When you are happy the action works, remove the branch name \`${branchName}\`` +
		'trigger from the snyk.yml (aka delete line 6), approve, and merge.';
	const defaultText = [step1, step2, step3];
	const checklistItems = languages.includes('Python')
		? pythonText.concat(defaultText)
		: defaultText;
	return checklistItems;
}

function generatePrBody(branchName: string, languages: string[]): string {
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
		markdownChecklist(createPRChecklist(languages, branchName)),
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
		'Kotlin',
		'Ruby',
		'Go',
	];

	//intersection of repo languages and workflow-supported languages
	const workflowSupportedLanguages = repoLanguages.filter((lang) =>
		workflowLanguages.includes(lang),
	);

	if (workflowSupportedLanguages.length === 0) {
		throw new Error('No supported languages provided, cannot generate PR');
	}

	const header = generatePrHeader(workflowSupportedLanguages);
	const body = generatePrBody(branch, repoLanguages);

	return [header, body];
}
