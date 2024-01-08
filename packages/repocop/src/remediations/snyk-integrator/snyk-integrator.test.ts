import { createYaml, generatePr } from './snyk-integrator';

describe('createYaml', () => {
	it('should skip node and sbt if no languages are provided', () => {
		const yaml = createYaml([]);
		const result = String.raw`name: Snyk
on:
  push:
    branches:
      - main
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
		const yaml = createYaml(['Scala', 'TypeScript', 'Python', 'Go']);
		const result = String.raw`name: Snyk
on:
  push:
    branches:
      - main
  workflow_dispatch: 
jobs:
  security:
    uses: guardian/.github/.github/workflows/sbt-node-snyk.yml@main
    with:
      ORG: <SNYK_ORG_ID>
      SKIP_PYTHON: false
      PYTHON_VERSION: <MAJOR.MINOR>
      SKIP_GO: false
    secrets:
      SNYK_TOKEN: ${'$'}{{ secrets.SNYK_TOKEN }}
`;
		expect(yaml).toEqual(result);
	});
});

describe('A generated PR', () => {
	//higher level function that takes in just languages and returns a PR
	function generateServiceCataloguePr(languages: string[]): [string, string] {
		return generatePr(languages, 'main', 'guardian/service-catalogue');
	}

	it('should have only the supported languages in its header', () => {
		const [header, body] = generateServiceCataloguePr([
			'Scala',
			'TypeScript',
			'Rust', //unsupported by the action
			'Kotlin', //unsupported by the action
			'Go',
		]);
		console.log(body);
		expect(header).toEqual(
			'Integrate Scala, TypeScript, Go projects with Snyk',
		);
	});
	it('should throw if no supported languages are provided', () => {
		expect(() => generateServiceCataloguePr(['Rust', 'Kotlin'])).toThrow();
		expect(() => generateServiceCataloguePr([])).toThrow();
	});
});
