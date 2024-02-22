import { createYaml, generateBranchName } from './snyk-integrator';

//TODO - WHY DO THESE TESTS STILL PASS????
describe('createYaml', () => {
	it('should skip node and sbt if no languages are provided', () => {
		const yaml = createYaml('branch');
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
		const yaml = createYaml('branch');

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

describe('generateBranchName', () => {
	it('includes a helpful prefix', () => {
		const branch = generateBranchName();
		expect(branch).toEqual(expect.stringMatching('integrate-snyk*'));
	});

	it('does not produce the same branch name twice', () => {
		const branch1 = generateBranchName();
		const branch2 = generateBranchName();
		expect(branch1).not.toEqual(branch2);
	});
});
