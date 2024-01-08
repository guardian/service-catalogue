import { createYaml } from './snyk-integrator';

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
