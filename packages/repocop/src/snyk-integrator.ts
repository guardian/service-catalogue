interface ActionInputs {
	skipNode: string;
	skipSbt: string;
	skipPython: string;
	skipGo: string;
	org: string;
	pythonVersion?: string;
	//TODO we might need the PIP_REQUIREMENTS_FILE input
}

function createActionInputs(languages: string[]): ActionInputs {
	const actionInputs: ActionInputs = {
		org: '<REPLACE>',
		skipSbt: languages.includes('Scala') ? '' : 'SKIP_SBT: true',
		skipNode:
			languages.includes('TypeScript') || languages.includes('JavaScript')
				? ''
				: 'SKIP_NODE: true',
		skipPython: languages.includes('Python') ? 'SKIP_PYTHON: false' : '',
		skipGo: languages.includes('Go') ? 'SKIP_GO: false' : '',
		pythonVersion: languages.includes('Python')
			? 'PYTHON_VERSION: <REPLACE ME>'
			: undefined,
	};
	return actionInputs;
}

const inputs = createActionInputs(['TypeScript', 'Python', 'Shell']);

const outputYaml =
	String.raw`
name: Snyk

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  security:
    uses: guardian/.github/.github/workflows/sbt-node-snyk.yml@main
    with:
      ORG: ${inputs.org}
      ${inputs.skipNode}
      ${inputs.skipSbt}
      ${inputs.skipPython}
      ${inputs.skipGo}
      ${inputs.pythonVersion}
    secrets:
       SNYK_TOKEN:` + ' ${{ secrets.SNYK_TOKEN }}';

export function runThis() {
	console.log('hello');
	console.log(outputYaml);
}
