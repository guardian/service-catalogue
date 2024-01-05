import { stringify } from 'yaml';

//TODO test this
export function createYaml(languages: string[]): string {
	const inputs = {
		ORG: '<REPLACE ME>',
		SKIP_SBT: languages.includes('Scala') ? undefined : true,
		SKIP_NODE:
			languages.includes('TypeScript') || languages.includes('JavaScript')
				? undefined
				: true,
		SKIP_PYTHON: languages.includes('Python') ? false : undefined,
		PYTHON_VERSION: languages.includes('Python') ? '<REPLACE ME>' : undefined,
		SKIP_GO: languages.includes('Go') ? false : undefined,
	};

	const myJson = {
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

	console.log(stringify(myJson).replace('{}', ''));
	return stringify(myJson).replace('{}', '');
}
