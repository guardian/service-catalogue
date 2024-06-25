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
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      - uses: scalacenter/sbt-dependency-submission@7ebd561e5280336d3d5b445a59013810ff79325e # v3.0.1
    permissions:
      contents: write
`;
		expect(yaml).toEqual(result);
	});
});
