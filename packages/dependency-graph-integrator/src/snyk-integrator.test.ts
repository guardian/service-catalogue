import { createYaml } from './snyk-integrator';

describe('createYaml', () => {
	it('should generate the following yaml file', () => {
		const yaml = createYaml('branch');
		const result = String.raw`name: Update Dependency Graph
on:
  push:
    branches:
      - main
      - branch
  workflow_dispatch: 
jobs:
  dependency-graph:
    name: Update Dependency Graph
    steps:
      - uses: actions/checkout@v4
      - uses: scalacenter/sbt-dependency-submission@v2
    permissions:
      contents: write
`;
		expect(yaml).toEqual(result);
	});
});
