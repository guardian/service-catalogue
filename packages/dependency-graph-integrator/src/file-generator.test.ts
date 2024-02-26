import { createYaml } from './file-generator';

describe('createYaml', () => {
	it('should generate the following yaml file', () => {
		const yaml = createYaml('branch');
		const result = String.raw`name: Update Dependency Graph for SBT
on:
  push:
    branches:
      - main
      - branch
  workflow_dispatch: 
jobs:
  dependency-graph:
    steps:
      - uses: actions/checkout@v4
      - uses: scalacenter/sbt-dependency-submission@v2
    permissions:
      contents: write
`;
		expect(yaml).toEqual(result);
	});
});
