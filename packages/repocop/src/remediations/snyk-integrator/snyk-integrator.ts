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

function generatePrBody(languages: string[]): string {
	return languages.join('\n');
}

export function generatePr(repoLanguages: string[]): [string, string] {
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
	const body = generatePrBody(workflowSupportedLanguages);

	return [header, body];
}
