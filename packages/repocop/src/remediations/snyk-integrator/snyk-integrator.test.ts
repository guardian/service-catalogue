import { createYaml } from './snyk-integrator';

describe('createYaml', () => {
	it('should create a yaml file', () => {
		const yaml = createYaml(['Scala', 'Python']);

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
      ORG: <REPLACE ME>
      SKIP_NODE: true
      SKIP_PYTHON: false
      PYTHON_VERSION: <REPLACE ME>
    secrets:
      SNYK_TOKEN: ${'$'}{{ secrets.SNYK_TOKEN }}
`;

		expect(yaml).toEqual(result);
	});
});
