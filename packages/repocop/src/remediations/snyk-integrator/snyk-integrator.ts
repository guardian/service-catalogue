import { h2, p, tsMarkdown } from 'ts-markdown';
import { stringify } from 'yaml';

interface SnykInputs {
	ORG: string;
	SKIP_SBT?: boolean;
	SKIP_NODE?: boolean;
	SKIP_PYTHON?: boolean;
	PYTHON_VERSION?: string;
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

export function createYaml(languages: string[]): string {
	const inputs: SnykInputs = {
		ORG: '<SNYK_ORG_ID>',
		SKIP_SBT: languages.includes('Scala') ? undefined : true,
		SKIP_NODE:
			languages.includes('TypeScript') || languages.includes('JavaScript')
				? undefined
				: true,
		SKIP_PYTHON: languages.includes('Python') ? false : undefined,
		PYTHON_VERSION: languages.includes('Python') ? '<MAJOR.MINOR>' : undefined,
		SKIP_GO: languages.includes('Go') ? false : undefined,
	};

	const snykWorkflowJson: SnykSchema = {
		name: 'Snyk',
		on: {
			push: {
				branches: ['main'],
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

	return stringify(snykWorkflowJson).replace('{}', '');
}

function generatePrHeader(languages: string[]): string {
	return `Integrate ${languages.join(', ')} projects with Snyk`;
}

function checklist(items: string[]): string {
	return items.map((item) => `- [ ] ${item}`).join('\n');
}

function generatePrBody(branchName: string, fullRepoName: string): string {
	const x = [
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
		checklist([
			'Replace the SNYK_ORG variable with one that your team already uses (you should have other repos integrated with Snyk. ' +
				'If you can’t find any, reach out to DevX)',
			'Replace the python version with the version your repo uses',
		]),
		h2('How do I check this works?'),
		checklist([
			`Run the action via the GitHub CLI \`gh workflow run ci.yml --ref ${branchName} --repo ${fullRepoName}\``,
			`View the action output, verify it has generated one project per dependency manifest.`,
		]),
	];
	return tsMarkdown(x);
}

export function generatePr(
	repoLanguages: string[],
	branch: string,
	fullRepoName: string,
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

	const header = generatePrHeader(workflowSupportedLanguages);
	const body = generatePrBody(branch, fullRepoName);

	return [header, body];
}
