import { createYaml, generatePr } from './snyk-integrator';

describe('createYaml', () => {
	it('should skip node and sbt if no languages are provided', () => {
		const yaml = createYaml([], 'branch');
		const result = String.raw`name: Snyk
on:
  push:
    branches:
      - main
      - branch
  workflow_dispatch: 
jobs:
  security:
    uses: guardian/.github/.github/workflows/sbt-node-snyk.yml@main
    with:
      ORG: <SNYK_ORG_ID>
      SKIP_SBT: true
      SKIP_NODE: true
    secrets:
      SNYK_TOKEN: ${'$'}{{ secrets.SNYK_TOKEN }}
`;
		expect(yaml).toEqual(result);
	});
	it('should not skip python and go if they are provided', () => {
		const yaml = createYaml(['Scala', 'TypeScript', 'Python', 'Go'], 'branch');

		const expectedInputKeys = [
			'ORG',
			'SKIP_PYTHON',
			'PYTHON_VERSION',
			'PIP_REQUIREMENTS_FILES',
			'PIPFILES',
			'SKIP_GO',
		];
		expectedInputKeys.forEach((key) => {
			expect(yaml).toContain(key);
		});
	});
});

describe('A generated PR', () => {
	//higher level function that takes in just languages and returns a PR
	function generateServiceCataloguePr(languages: string[]): [string, string] {
		return generatePr(languages, 'main');
	}

	it('should have only the supported languages in its header', () => {
		const header = generateServiceCataloguePr([
			'Scala',
			'TypeScript',
			'Rust', //unsupported by the action
			'Go',
		])[0];

		expect(header).toEqual(
			'Integrate Scala, TypeScript, Go projects with Snyk',
		);
	});
	it('should throw if no supported languages are provided', () => {
		expect(() => generateServiceCataloguePr(['Rust'])).toThrow();
		expect(() => generateServiceCataloguePr([])).toThrow();
	});
});
